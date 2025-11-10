import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TeamInvitation {
  id: string;
  team_id: string;
  invited_by: string;
  email: string;
  invited_user_id: string | null;
  status: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
}

export const useTeamInvitations = (teamId: string | null) => {
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    const fetchInvitations = async () => {
      try {
        const { data, error } = await supabase
          .from("team_invitations")
          .select("*")
          .eq("team_id", teamId)
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setInvitations(data || []);
      } catch (error) {
        console.error("Error fetching invitations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();

    const channel = supabase
      .channel(`team-invitations-${teamId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "team_invitations",
          filter: `team_id=eq.${teamId}`,
        },
        () => {
          fetchInvitations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId]);

  const sendInvitation = async (emailOrUserId: string, isUserId: boolean = false) => {
    if (!teamId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let invitedUserId: string | null = null;
      let email: string = emailOrUserId;

      if (isUserId) {
        // User was selected from search
        invitedUserId = emailOrUserId;
        
        // Get user's email/username for the invitation record
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("user_id", emailOrUserId)
          .single();
        
        if (!profile) throw new Error("User not found");
        email = profile.username;
      } else {
        // Try to find existing user by username or email
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("user_id, username")
          .or(`username.eq.${emailOrUserId},username.ilike.${emailOrUserId.split('@')[0]}`)
          .maybeSingle();

        if (existingProfile) {
          invitedUserId = existingProfile.user_id;
        }
      }

      const { error } = await supabase.from("team_invitations").insert({
        team_id: teamId,
        invited_by: user.id,
        email,
        invited_user_id: invitedUserId,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: invitedUserId 
          ? "User invited to team" 
          : "Invitation sent by email",
      });
    } catch (error: any) {
      console.error("Error sending invitation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  const acceptInvitation = async (invitationId: string) => {
    try {
      const { data: invitation } = await supabase
        .from("team_invitations")
        .select("*")
        .eq("id", invitationId)
        .single();

      if (!invitation) throw new Error("Invitation not found");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: memberError } = await supabase
        .from("team_members")
        .insert({
          team_id: invitation.team_id,
          user_id: user.id,
          status: "active",
        });

      if (memberError) throw memberError;

      const { error: inviteError } = await supabase
        .from("team_invitations")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", invitationId);

      if (inviteError) throw inviteError;

      toast({
        title: "Success",
        description: "Invitation accepted",
      });
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept invitation",
        variant: "destructive",
      });
    }
  };

  const declineInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from("team_invitations")
        .update({ status: "declined" })
        .eq("id", invitationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invitation declined",
      });
    } catch (error) {
      console.error("Error declining invitation:", error);
      toast({
        title: "Error",
        description: "Failed to decline invitation",
        variant: "destructive",
      });
    }
  };

  return {
    invitations,
    loading,
    sendInvitation,
    acceptInvitation,
    declineInvitation,
  };
};
