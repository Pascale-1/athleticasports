import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Event } from "@/lib/events";

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
}

export const useEvents = (teamId?: string | null, filters?: {
  type?: string;
  status?: 'upcoming' | 'past' | 'all';
  isPublic?: boolean;
  includeAsOpponent?: boolean;
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();

    const channel = supabase
      .channel(`events-${teamId || 'all'}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "events",
        },
        () => {
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId, filters]);

  const fetchEvents = async () => {
    try {
      let query = supabase
        .from("events" as any)
        .select("*")
        .order("start_time", { ascending: true });

      // Apply filters
      if (teamId !== undefined) {
        if (teamId === null) {
          query = query.is('team_id', null);
        } else {
          // Support querying by both team_id and opponent_team_id
          if (filters?.includeAsOpponent) {
            query = query.or(`team_id.eq.${teamId},opponent_team_id.eq.${teamId}`);
          } else {
            query = query.eq("team_id", teamId);
          }
        }
      }

      if (filters?.type && filters.type !== 'all') {
        query = query.eq("type", filters.type);
      }

      if (filters?.isPublic !== undefined) {
        query = query.eq("is_public", filters.isPublic);
      }

      const { data, error } = await query;

      if (error) throw error;

      let filteredEvents = (data || []) as unknown as Event[];

      // Apply status filter
      if (filters?.status === 'upcoming') {
        const now = new Date().toISOString();
        filteredEvents = filteredEvents.filter(e => e.start_time >= now);
      } else if (filters?.status === 'past') {
        const now = new Date().toISOString();
        filteredEvents = filteredEvents.filter(e => e.end_time < now);
      }

      setEvents(filteredEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (data: CreateEventData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("events" as any).insert({
        ...data,
        created_by: user.id,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event created successfully",
      });

      // Immediately refetch to show the new event
      await fetchEvents();

      return true;
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
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

      toast({
        title: "Success",
        description: "Event updated successfully",
      });

      // Immediately refetch to show the updates
      await fetchEvents();

      return true;
    } catch (error: any) {
      console.error("Error updating event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update event",
        variant: "destructive",
      });
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

      toast({
        title: "Success",
        description: "Event deleted successfully",
      });

      // Immediately refetch to remove deleted event
      await fetchEvents();

      return true;
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
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
