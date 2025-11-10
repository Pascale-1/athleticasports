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
  role: string;
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

  const sendInvitation = async (emailOrUserId: string, isUserId: boolean = false, role: "member" | "coach" | "admin" | "owner" = "member") => {
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
        // Sanitize input to prevent SQL injection
        const sanitizedInput = emailOrUserId.replace(/[%_']/g, '\\$&')
        const usernamePrefix = emailOrUserId.includes('@') ? sanitizedInput.split('@')[0] : sanitizedInput
        
        // Try to find existing user by username or email
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("user_id, username")
          .or(`username.eq.${sanitizedInput},username.ilike.${usernamePrefix}`)
          .maybeSingle();

        if (existingProfile) {
          invitedUserId = existingProfile.user_id;
        }
      }

      // Check for existing pending invitation
      const { data: existingInvitation } = await supabase
        .from("team_invitations")
        .select("id")
        .eq("team_id", teamId)
        .eq("email", email)
        .eq("status", "pending")
        .maybeSingle();

      if (existingInvitation) {
        toast({
          title: "Already invited",
          description: "This user already has a pending invitation",
          variant: "destructive",
        });
        return;
      }

      const { data: newInvitation, error } = await supabase
        .from("team_invitations")
        .insert([{
          team_id: teamId,
          invited_by: user.id,
          email,
          invited_user_id: invitedUserId,
          role: role as "member" | "coach" | "admin" | "owner",
        }])
        .select()
        .single();

      if (error) throw error;

      // Send email via edge function
      try {
        const { error: emailError } = await supabase.functions.invoke(
          'send-team-invitation',
          {
            body: {
              invitationId: newInvitation.id,
              teamId: teamId,
              recipientEmail: email,
              role: role,
            },
          }
        );

        if (emailError) {
          console.error("Error sending invitation email:", emailError);
          toast({
            title: "Success",
            description: "Invitation created (email failed to send)",
          });
        } else {
          toast({
            title: "Success",
            description: "Invitation sent successfully",
          });
        }
      } catch (emailError) {
        console.error("Error calling email function:", emailError);
        toast({
          title: "Success",
          description: "Invitation created (email failed to send)",
        });
      }
    } catch (error: any) {
      console.error("Error sending invitation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from("team_invitations")
        .delete()
        .eq("id", invitationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invitation cancelled",
      });
    } catch (error: any) {
      console.error("Error cancelling invitation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel invitation",
        variant: "destructive",
      });
    }
  };

  const resendInvitation = async (invitationId: string) => {
    try {
      const { data: invitation } = await supabase
        .from("team_invitations")
        .select("*")
        .eq("id", invitationId)
        .single();

      if (!invitation) throw new Error("Invitation not found");

      // Call edge function to resend email
      const { error: emailError } = await supabase.functions.invoke(
        'send-team-invitation',
        {
          body: {
            invitationId: invitation.id,
            teamId: invitation.team_id,
            recipientEmail: invitation.email,
            role: invitation.role,
          },
        }
      );

      if (emailError) {
        throw emailError;
      }

      // Update the created_at timestamp to show it was resent
      await supabase
        .from("team_invitations")
        .update({ created_at: new Date().toISOString() })
        .eq("id", invitationId);

      toast({
        title: "Success",
        description: "Invitation resent successfully",
      });
    } catch (error: any) {
      console.error("Error resending invitation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to resend invitation",
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

      const { data: newMember, error: memberError } = await supabase
        .from("team_members")
        .insert({
          team_id: invitation.team_id,
          user_id: user.id,
          status: "active",
        })
        .select()
        .single();

      if (memberError) throw memberError;

      // Add member role with the role from invitation
      const { error: roleError } = await supabase
        .from("team_member_roles")
        .insert({
          team_member_id: newMember.id,
          role: invitation.role as "member" | "coach" | "admin" | "owner",
          assigned_by: invitation.invited_by,
        });

      if (roleError) throw roleError;

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
    cancelInvitation,
    resendInvitation,
    acceptInvitation,
    declineInvitation,
  };
};
