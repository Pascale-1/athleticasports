import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeSubscription } from "@/lib/realtimeManager";

export interface TrainingSession {
  id: string;
  team_id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string;
  end_time: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useTrainingSessions = (teamId: string | null) => {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSessions = async () => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("team_id", teamId)
        .order("start_time", { ascending: true });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error("Error fetching training sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [teamId]);

  // Use ref to store fetchSessions for stable callback
  const fetchSessionsRef = useRef(fetchSessions);
  fetchSessionsRef.current = fetchSessions;

  // Realtime subscription using centralized manager
  const handleRealtimeChange = useCallback(() => {
    fetchSessionsRef.current();
  }, []);

  useRealtimeSubscription(
    `training-sessions-${teamId}`,
    [{ table: "events", event: "*", filter: `team_id=eq.${teamId}` }],
    handleRealtimeChange,
    !!teamId
  );

  const createSession = async (data: {
    title: string;
    description?: string;
    location?: string;
    start_time: string;
    end_time: string;
  }) => {
    if (!teamId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("events").insert({
        team_id: teamId,
        type: "training",
        created_by: user.id,
        ...data,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Training session created",
      });

      // Immediately refetch to show the new session
      await fetchSessions();
    } catch (error: any) {
      console.error("Error creating session:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create training session",
        variant: "destructive",
      });
    }
  };

  const updateSession = async (
    sessionId: string,
    data: Partial<Omit<TrainingSession, "id" | "team_id" | "created_by" | "created_at">>
  ) => {
    try {
      const { error } = await supabase
        .from("events")
        .update(data)
        .eq("id", sessionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Training session updated",
      });

      // Immediately refetch to show the updates
      await fetchSessions();
    } catch (error) {
      console.error("Error updating session:", error);
      toast({
        title: "Error",
        description: "Failed to update training session",
        variant: "destructive",
      });
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", sessionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Training session deleted",
      });

      // Immediately refetch to remove deleted session
      await fetchSessions();
    } catch (error) {
      console.error("Error deleting session:", error);
      toast({
        title: "Error",
        description: "Failed to delete training session",
        variant: "destructive",
      });
    }
  };

  return {
    sessions,
    loading,
    createSession,
    updateSession,
    deleteSession,
  };
};
