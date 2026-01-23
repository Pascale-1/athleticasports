import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSubscription } from "@/lib/realtimeManager";
import { Event } from "@/lib/events";

export interface CreatedEvent extends Event {
  attendingCount?: number;
  maybeCount?: number;
  pendingRequestsCount?: number;
}

export interface CreatedEventsFilters {
  status?: 'upcoming' | 'past' | 'all';
}

/**
 * Hook to fetch events created by the current user.
 * Shows all events regardless of RSVP status - for organizer management.
 */
export const useCreatedEvents = (filters?: CreatedEventsFilters) => {
  const [events, setEvents] = useState<CreatedEvent[]>([]);
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

      // Fetch events created by the user
      let query = supabase
        .from("events")
        .select("*")
        .eq("created_by", userId);

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

      const eventIds = (eventsData || []).map(e => e.id);
      
      if (eventIds.length === 0) {
        setEvents([]);
        setLoading(false);
        return;
      }

      // Fetch attendance counts
      const { data: attendanceCounts } = await supabase
        .from("event_attendance")
        .select("event_id, status")
        .in("event_id", eventIds);

      // Fetch pending join requests count
      const { data: joinRequests } = await supabase
        .from("event_join_requests")
        .select("event_id")
        .in("event_id", eventIds)
        .eq("status", "pending");

      // Count attendance per event
      const countsMap = new Map<string, { attending: number; maybe: number }>();
      (attendanceCounts || []).forEach(a => {
        const current = countsMap.get(a.event_id) || { attending: 0, maybe: 0 };
        if (a.status === 'attending') current.attending++;
        else if (a.status === 'maybe') current.maybe++;
        countsMap.set(a.event_id, current);
      });

      // Count pending requests per event
      const requestsMap = new Map<string, number>();
      (joinRequests || []).forEach(r => {
        requestsMap.set(r.event_id, (requestsMap.get(r.event_id) || 0) + 1);
      });

      // Process events with counts
      const processedEvents: CreatedEvent[] = (eventsData || []).map(event => {
        const counts = countsMap.get(event.id);
        const pendingRequests = requestsMap.get(event.id) || 0;
        
        return {
          ...event,
          attendingCount: counts?.attending || 0,
          maybeCount: counts?.maybe || 0,
          pendingRequestsCount: pendingRequests,
        };
      });

      setEvents(processedEvents);
    } catch (error) {
      console.error("Error fetching created events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [userId, filters?.status]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Subscribe to events table changes
  useRealtimeSubscription(
    `created-events-${userId}`,
    [{ table: "events", event: "*", filter: `created_by=eq.${userId}` }],
    () => {
      fetchEvents();
    },
    !!userId
  );

  // Subscribe to join requests changes
  useRealtimeSubscription(
    `created-events-requests-${userId}`,
    [{ table: "event_join_requests", event: "*" }],
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
