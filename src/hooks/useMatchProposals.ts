import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeSubscription } from "@/lib/realtimeManager";

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

  const [userId, setUserId] = useState<string | null>(null);

  // Declare fetchProposals BEFORE it's used
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

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
    fetchProposals();
  }, []);

  // Use ref to store fetchProposals for stable callback
  const fetchProposalsRef = useRef(fetchProposals);
  fetchProposalsRef.current = fetchProposals;

  // Realtime subscription using centralized manager
  const handleRealtimeChange = useCallback(() => {
    fetchProposalsRef.current();
  }, []);

  useRealtimeSubscription(
    "match-proposals",
    [{ table: "match_proposals", event: "*", filter: userId ? `player_user_id=eq.${userId}` : undefined }],
    handleRealtimeChange,
    !!userId
  );

  const acceptProposal = async (proposalId: string) => {
    // Track completed operations for rollback
    let proposalUpdated = false;
    let attendanceCreated = false;
    let previousAvailabilityIds: string[] = [];

    const proposal = proposals.find(p => p.id === proposalId);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (!proposal) throw new Error("Proposal not found");

      // Step 1: Update proposal status
      const { error: proposalError } = await supabase
        .from("match_proposals")
        .update({
          status: "accepted",
          responded_at: new Date().toISOString(),
          commitment_acknowledged_at: new Date().toISOString(),
        })
        .eq("id", proposalId)
        .eq("status", "pending"); // Ensure we only update pending proposals (prevents race condition)

      if (proposalError) throw proposalError;
      proposalUpdated = true;

      // Step 2: Add to event attendance with committed flag
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
      attendanceCreated = true;

      // Step 3: Get active availability IDs before deactivating (for potential rollback)
      const { data: activeAvailability } = await supabase
        .from("player_availability")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true);

      previousAvailabilityIds = activeAvailability?.map(a => a.id) || [];

      // Step 4: Deactivate player's availability
      if (previousAvailabilityIds.length > 0) {
        const { error: availabilityError } = await supabase
          .from("player_availability")
          .update({ is_active: false })
          .in("id", previousAvailabilityIds);

        if (availabilityError) throw availabilityError;
      }

      toast({
        title: "Match accepted!",
        description: "You're now committed to attend this match.",
      });

      // Refresh proposals
      await fetchProposals();
      return true;
    } catch (error: any) {
      console.error("Error accepting proposal:", error);

      // Rollback: revert changes in reverse order
      try {
        const { data: { user } } = await supabase.auth.getUser();

        // Rollback availability deactivation
        if (previousAvailabilityIds.length > 0) {
          await supabase
            .from("player_availability")
            .update({ is_active: true })
            .in("id", previousAvailabilityIds);
        }

        // Rollback attendance creation
        if (attendanceCreated && proposal && user) {
          await supabase
            .from("event_attendance")
            .delete()
            .eq("event_id", proposal.event_id)
            .eq("user_id", user.id);
        }

        // Rollback proposal status
        if (proposalUpdated) {
          await supabase
            .from("match_proposals")
            .update({
              status: "pending",
              responded_at: null,
              commitment_acknowledged_at: null,
            })
            .eq("id", proposalId);
        }
      } catch (rollbackError) {
        console.error("Error during rollback:", rollbackError);
      }

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
