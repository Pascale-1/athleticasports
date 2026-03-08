import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Event } from "@/lib/events";
import { useRealtimeSubscription } from "@/lib/realtimeManager";

export interface CreateEventData {
  team_id?: string | null;
  opponent_team_id?: string | null;
  type: 'training' | 'meetup' | 'match';
  title: string;
  description?: string;
  location?: string;
  location_type?: 'physical' | 'virtual' | 'tbd';
  location_url?: string;
  start_time: string;
  end_time: string;
  max_participants?: number;
  is_public?: boolean;
  is_recurring?: boolean;
  recurrence_rule?: string;
  opponent_name?: string;
  opponent_logo_url?: string;
  match_format?: string;
  home_away?: 'home' | 'away' | 'neutral';
  meetup_category?: string;
  looking_for_players?: boolean;
  players_needed?: number;
  rsvp_deadline?: string;
  sport?: string;
  cost?: string;
  cost_type?: 'total' | 'per_person';
  payment_link?: string;
  payment_method?: string;
}

export const useEvents = (teamId?: string | null, filters?: {
  type?: string;
  status?: 'upcoming' | 'past' | 'all';
  isPublic?: boolean;
  includeAsOpponent?: boolean;
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const filtersKey = JSON.stringify({
    type: filters?.type,
    status: filters?.status,
    isPublic: filters?.isPublic,
    includeAsOpponent: filters?.includeAsOpponent,
  });

  const teamIdRef = useRef(teamId);
  const filtersRef = useRef(filters);

  useEffect(() => {
    teamIdRef.current = teamId;
    filtersRef.current = filters;
  }, [teamId, filtersKey]);

  const fetchEvents = useCallback(async () => {
    const currentTeamId = teamIdRef.current;
    const currentFilters = filtersRef.current;
    try {
      let query = supabase
        .from("events" as any)
        .select("*")
        .order("start_time", { ascending: true });

      if (currentTeamId !== undefined) {
        if (currentTeamId === null) {
          query = query.is('team_id', null);
        } else {
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(currentTeamId)) {
            throw new Error("Invalid team ID format");
          }
          if (currentFilters?.includeAsOpponent) {
            query = query.or(`team_id.eq.${currentTeamId},opponent_team_id.eq.${currentTeamId}`);
          } else {
            query = query.eq("team_id", currentTeamId);
          }
        }
      }

      if (currentFilters?.type && currentFilters.type !== 'all') {
        query = query.eq("type", currentFilters.type);
      }

      if (currentFilters?.isPublic !== undefined) {
        query = query.eq("is_public", currentFilters.isPublic);
      }

      const { data, error } = await query;

      if (error) throw error;

      let filteredEvents = (data || []) as unknown as Event[];

      if (currentFilters?.status === 'upcoming') {
        const now = new Date().toISOString();
        filteredEvents = filteredEvents.filter(e => e.start_time >= now);
      } else if (currentFilters?.status === 'past') {
        const now = new Date().toISOString();
        filteredEvents = filteredEvents.filter(e => e.end_time < now);
      }

      setEvents(filteredEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Error", { description: "Failed to load events" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [teamId, filtersKey, fetchEvents]);

  useRealtimeSubscription(
    `events-${teamId || 'all'}`,
    [{ table: "events", event: "*" }],
    fetchEvents,
    true
  );

  const createEvent = async (data: CreateEventData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("events" as any).insert({
        ...data,
        created_by: user.id,
      });

      if (error) throw error;

      await fetchEvents();
      return true;
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast.error("Error", { description: error.message || "Failed to create event" });
      return false;
    }
  };

  const updateEvent = async (eventId: string, data: Partial<CreateEventData>) => {
    try {
      const { error } = await supabase
        .from("events" as any)
        .update(data)
        .eq("id", eventId);

      if (error) throw error;

      await fetchEvents();
      return true;
    } catch (error: any) {
      console.error("Error updating event:", error);
      toast.error("Error", { description: error.message || "Failed to update event" });
      return false;
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from("events" as any)
        .delete()
        .eq("id", eventId);

      if (error) throw error;

      await fetchEvents();
      return true;
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast.error("Error", { description: error.message || "Failed to delete event" });
      return false;
    }
  };

  return {
    events,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchEvents,
  };
};
