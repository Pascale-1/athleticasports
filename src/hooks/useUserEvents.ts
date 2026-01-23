import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSubscription } from "@/lib/realtimeManager";
import { Event } from "@/lib/events";

export interface UserEvent extends Event {
  userStatus?: 'attending' | 'maybe' | 'not_attending' | null;
  attendingCount?: number;
  maybeCount?: number;
}

export interface UserEventsFilters {
  type?: 'match' | 'training' | 'meetup';
  status?: 'upcoming' | 'past';
  includeNotAttending?: boolean; // Default false - exclude events user declined
}

/**
 * Hook to fetch events where the user has an attendance record.
 * Subscribes to both events and event_attendance tables for real-time updates.
 * By default, excludes events where user marked as "not_attending".
 */
export const useUserEvents = (filters?: UserEventsFilters) => {
  const [events, setEvents] = useState<UserEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  const fetchEvents = useCallback(async () => {
    if (!userId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch events with user's attendance
      let query = supabase
        .from("events")
        .select(`
          *,
          event_attendance!inner(user_id, status)
        `)
        .eq("event_attendance.user_id", userId);

      // Apply type filter
      if (filters?.type) {
        query = query.eq("type", filters.type);
      }

      // Apply status filter (upcoming/past)
      if (filters?.status === 'upcoming') {
        query = query.gte("start_time", new Date().toISOString());
      } else if (filters?.status === 'past') {
        query = query.lt("start_time", new Date().toISOString());
      }

      // Order by start time
      query = query.order("start_time", { ascending: filters?.status !== 'past' });

      const { data: eventsData, error } = await query;

      if (error) throw error;

      // Process events with attendance data
      const processedEvents: UserEvent[] = (eventsData || [])
        .map(event => {
          const userAttendance = event.event_attendance?.find(
            (a: { user_id: string; status: string }) => a.user_id === userId
          );
          
          return {
            ...event,
            userStatus: userAttendance?.status as UserEvent['userStatus'],
            event_attendance: undefined, // Remove raw attendance data
          };
        })
        // Filter out "not_attending" unless explicitly included
        .filter(event => {
          if (filters?.includeNotAttending) return true;
          return event.userStatus !== 'not_attending';
        });

      // Fetch attendance counts for each event
      const eventIds = processedEvents.map(e => e.id);
      if (eventIds.length > 0) {
        const { data: attendanceCounts } = await supabase
          .from("event_attendance")
          .select("event_id, status")
          .in("event_id", eventIds);

        // Count attendance per event
        const countsMap = new Map<string, { attending: number; maybe: number }>();
        (attendanceCounts || []).forEach(a => {
          const current = countsMap.get(a.event_id) || { attending: 0, maybe: 0 };
          if (a.status === 'attending') current.attending++;
          else if (a.status === 'maybe') current.maybe++;
          countsMap.set(a.event_id, current);
        });

        // Add counts to events
        processedEvents.forEach(event => {
          const counts = countsMap.get(event.id);
          event.attendingCount = counts?.attending || 0;
          event.maybeCount = counts?.maybe || 0;
        });
      }

      setEvents(processedEvents);
    } catch (error) {
      console.error("Error fetching user events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [userId, filters?.type, filters?.status, filters?.includeNotAttending]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Subscribe to events table changes
  useRealtimeSubscription(
    `user-events-${userId}`,
    [{ table: "events", event: "*" }],
    () => {
      fetchEvents();
    },
    !!userId
  );

  // Subscribe to event_attendance changes for this user
  useRealtimeSubscription(
    `user-attendance-${userId}`,
    [{ table: "event_attendance", event: "*", filter: `user_id=eq.${userId}` }],
    () => {
      fetchEvents();
    },
    !!userId
  );

  return {
    events,
    loading,
    refetch: fetchEvents,
  };
};
