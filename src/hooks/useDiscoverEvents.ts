import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Event } from "@/lib/events";
import { useRealtimeSubscription } from "@/lib/realtimeManager";

export const useDiscoverEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      // Fetch all upcoming public events
      let query = supabase
        .from("events")
        .select(`
          *,
          event_attendance(user_id, status)
        `)
        .eq("is_public", true)
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true })
        .limit(50);

      // Exclude user's own events
      if (currentUserId) {
        query = query.neq("created_by", currentUserId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter out events where user already RSVP'd (attending or not_attending)
      const filtered = (data || [])
        .filter(event => {
          if (!currentUserId) return true;
          const attendance = event.event_attendance || [];
          return !attendance.some(
            (a: { user_id: string; status: string }) =>
              a.user_id === currentUserId &&
              (a.status === "attending" || a.status === "not_attending")
          );
        })
        .map(({ event_attendance, ...rest }) => rest) as unknown as Event[];

      setEvents(filtered);
    } catch (error) {
      console.error("Error fetching discover events:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useRealtimeSubscription(
    "discover-events",
    [{ table: "events", event: "*" }],
    fetchEvents,
    true
  );

  useRealtimeSubscription(
    `discover-attendance-${userId}`,
    [{ table: "event_attendance", event: "*" }],
    fetchEvents,
    !!userId
  );

  return { events, loading, refetch: fetchEvents };
};
