import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface InterestedPlayer {
  id: string;
  player_user_id: string;
  match_score: number | null;
  interest_level: string | null;
  proposed_at: string | null;
  profile?: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export const useEventInterestedPlayers = (eventId: string | undefined, isOrganizer: boolean) => {
  const [players, setPlayers] = useState<InterestedPlayer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!eventId || !isOrganizer) return;

    const fetch = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("match_proposals")
          .select(`
            id,
            player_user_id,
            match_score,
            interest_level,
            proposed_at,
            profile:profiles!match_proposals_player_user_id_fkey (
              username,
              display_name,
              avatar_url
            )
          `)
          .eq("event_id", eventId)
          .in("interest_level", ["maybe", "interested", "pending"])
          .eq("status", "pending");

        if (error) throw error;
        setPlayers((data as any) || []);
      } catch (err) {
        console.error("Error fetching interested players:", err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [eventId, isOrganizer]);

  const invitePlayer = async (proposalId: string, playerId: string) => {
    if (!eventId) return false;
    try {
      // Update proposal status
      const { error: proposalError } = await supabase
        .from("match_proposals")
        .update({ status: "accepted", responded_at: new Date().toISOString() })
        .eq("id", proposalId);

      if (proposalError) throw proposalError;

      // Add attendance
      const { error: attendanceError } = await supabase
        .from("event_attendance")
        .upsert({
          event_id: eventId,
          user_id: playerId,
          status: "attending",
        }, { onConflict: "event_id,user_id" });

      if (attendanceError) throw attendanceError;

      // Remove from list
      setPlayers(prev => prev.filter(p => p.id !== proposalId));
      return true;
    } catch (err) {
      console.error("Error inviting player:", err);
      return false;
    }
  };

  return { players, loading, invitePlayer };
};
