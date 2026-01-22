import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/lib/events";

interface ConflictResult {
  conflicts: Event[];
  loading: boolean;
  checkConflicts: (startTime: Date, endTime: Date) => Promise<Event[]>;
}

export const useEventConflicts = (
  teamId?: string | null,
  excludeEventId?: string
): ConflictResult => {
  const [conflicts, setConflicts] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  const checkConflicts = useCallback(
    async (startTime: Date, endTime: Date): Promise<Event[]> => {
      if (!startTime || !endTime) {
        setConflicts([]);
        return [];
      }

      setLoading(true);
      try {
        let query = supabase
          .from("events" as any)
          .select("*")
          .or(
            `and(start_time.lte.${endTime.toISOString()},end_time.gte.${startTime.toISOString()})`
          );

        // Filter by team if provided
        if (teamId) {
          query = query.eq("team_id", teamId);
        }

        // Exclude current event when editing
        if (excludeEventId) {
          query = query.neq("id", excludeEventId);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error checking conflicts:", error);
          setConflicts([]);
          return [];
        }

        const conflictingEvents = (data || []) as unknown as Event[];
        setConflicts(conflictingEvents);
        return conflictingEvents;
      } catch (error) {
        console.error("Error checking conflicts:", error);
        setConflicts([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [teamId, excludeEventId]
  );

  return {
    conflicts,
    loading,
    checkConflicts,
  };
};
