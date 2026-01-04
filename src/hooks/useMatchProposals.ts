import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface MatchProposal {
  id: string;
  event_id: string;
  player_user_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  proposed_at: string;
  responded_at: string | null;
  commitment_acknowledged_at: string | null;
  event?: {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    location: string | null;
    type: string;
    max_participants: number | null;
    players_needed: number | null;
    created_by: string;
  };
}

export const useMatchProposals = () => {
  const [proposals, setProposals] = useState<MatchProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProposals();

    // Subscribe to real-time updates
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel("match-proposals")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "match_proposals",
            filter: `player_user_id=eq.${user.id}`,
          },
          () => {
            fetchProposals();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupSubscription();
  }, []);

  const fetchProposals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("match_proposals")
        .select(`
          *,
          event:events (
            id,
            title,
            start_time,
            end_time,
            location,
            type,
            max_participants,
            players_needed,
            created_by
          )
        `)
        .eq("player_user_id", user.id)
        .eq("status", "pending")
        .order("proposed_at", { ascending: false });

      if (error) throw error;
      setProposals((data || []) as MatchProposal[]);
    } catch (error) {
      console.error("Error fetching proposals:", error);
    } finally {
      setLoading(false);
    }
  };

  const acceptProposal = async (proposalId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const proposal = proposals.find(p => p.id === proposalId);
      if (!proposal) throw new Error("Proposal not found");

      // Update proposal status
      const { error: proposalError } = await supabase
        .from("match_proposals")
        .update({
          status: "accepted",
          responded_at: new Date().toISOString(),
          commitment_acknowledged_at: new Date().toISOString(),
        })
        .eq("id", proposalId);

      if (proposalError) throw proposalError;

      // Add to event attendance with committed flag
      const { error: attendanceError } = await supabase
        .from("event_attendance")
        .upsert({
          event_id: proposal.event_id,
          user_id: user.id,
          status: "attending",
          is_committed: true,
        }, {
          onConflict: 'event_id,user_id'
        });

      if (attendanceError) throw attendanceError;

      // Deactivate player's availability
      await supabase
        .from("player_availability")
        .update({ is_active: false })
        .eq("user_id", user.id)
        .eq("is_active", true);

      toast({
        title: "Match accepted!",
        description: "You're now committed to attend this match.",
      });

      // Refresh proposals
      await fetchProposals();
      return true;
    } catch (error: any) {
      console.error("Error accepting proposal:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept proposal",
        variant: "destructive",
      });
      return false;
    }
  };

  const declineProposal = async (proposalId: string) => {
    try {
      const { error } = await supabase
        .from("match_proposals")
        .update({
          status: "declined",
          responded_at: new Date().toISOString(),
        })
        .eq("id", proposalId);

      if (error) throw error;

      toast({
        title: "Proposal declined",
        description: "We'll keep looking for other matches.",
      });

      await fetchProposals();
      return true;
    } catch (error: any) {
      console.error("Error declining proposal:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to decline proposal",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    proposals,
    loading,
    acceptProposal,
    declineProposal,
    refetch: fetchProposals,
  };
};
