import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRealtimeSubscription } from "@/lib/realtimeManager";
import { getAppBaseUrl } from "@/lib/appUrl";

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

  const fetchInvitations = async () => {
    if (!teamId) {
      setLoading(false);
      return;
    }

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

  useEffect(() => {
    fetchInvitations();
  }, [teamId]);

  const fetchInvitationsRef = useRef(fetchInvitations);
  fetchInvitationsRef.current = fetchInvitations;

  const handleRealtimeChange = useCallback(() => {
    fetchInvitationsRef.current();
  }, []);

  useRealtimeSubscription(
    `team-invitations-${teamId}`,
    [{ table: "team_invitations", event: "*", filter: `team_id=eq.${teamId}` }],
    handleRealtimeChange,
    !!teamId
  );

  const sendInvitation = async (emailOrUserId: string, isUserId: boolean = false, role: "member" | "coach" | "admin" | "owner" = "member") => {
    if (!teamId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let invitedUserId: string | null = null;
      let email: string = emailOrUserId;

      if (isUserId) {
        invitedUserId = emailOrUserId;
        const { data: resolvedEmail } = await supabase.rpc('get_user_email_by_id' as any, { _user_id: emailOrUserId });
        if (!resolvedEmail) throw new Error("User not found");
        email = resolvedEmail as string;
      } else {
        const { data: exactMatch } = await supabase
          .from("profiles_public")
          .select("user_id, username")
          .eq("username", emailOrUserId)
          .maybeSingle();

        if (exactMatch) {
          invitedUserId = exactMatch.user_id;
          const { data: resolvedEmail } = await supabase.rpc('get_user_email_by_id' as any, { _user_id: exactMatch.user_id });
          if (resolvedEmail) email = resolvedEmail as string;
        } else if (emailOrUserId.includes('@')) {
          const { data: resolvedUserId } = await supabase.rpc('resolve_user_id_by_email' as any, { _email: emailOrUserId });
          if (resolvedUserId) {
            invitedUserId = resolvedUserId as string;
          }
        }
      }

      const { data: existingInvitation } = await supabase
        .from("team_invitations")
        .select("id")
        .eq("team_id", teamId)
        .eq("email", email)
        .eq("status", "pending")
        .maybeSingle();

      if (existingInvitation) {
        toast.error("Already invited", { description: "This user already has a pending invitation" });
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

      if (invitedUserId) {
        toast.success("Success", { description: "Invitation sent — they'll see it in their notifications" });
      } else {
        try {
          const { error: emailError } = await supabase.functions.invoke(
            'send-team-invitation',
            {
              body: {
                invitationId: newInvitation.id,
                teamId: teamId,
                recipientEmail: email,
                role: role,
                appOrigin: getAppBaseUrl(),
              },
            }
          );

          if (emailError) {
            console.error("Error sending invitation email:", emailError);
            toast.success("Success", { description: "Invitation created (email failed to send)" });
          } else {
            toast.success("Success", { description: "Invitation email sent successfully" });
          }
        } catch (emailError) {
          console.error("Error calling email function:", emailError);
          toast.success("Success", { description: "Invitation created (email failed to send)" });
        }
      }
    } catch (error: any) {
      console.error("Error sending invitation:", error);
      toast.error("Error", { description: error.message || "Failed to send invitation" });
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from("team_invitations")
        .delete()
        .eq("id", invitationId);

      if (error) throw error;

      toast.success("Success", { description: "Invitation cancelled" });
    } catch (error: any) {
      console.error("Error cancelling invitation:", error);
      toast.error("Error", { description: error.message || "Failed to cancel invitation" });
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

      const { error: emailError } = await supabase.functions.invoke(
        'send-team-invitation',
        {
          body: {
            invitationId: invitation.id,
            teamId: invitation.team_id,
            recipientEmail: invitation.email,
            role: invitation.role,
            appOrigin: getAppBaseUrl(),
          },
        }
      );

      if (emailError) {
        throw emailError;
      }

      await supabase
        .from("team_invitations")
        .update({ created_at: new Date().toISOString() })
        .eq("id", invitationId);

      toast.success("Success", { description: "Invitation resent successfully" });
    } catch (error: any) {
      console.error("Error resending invitation:", error);
      toast.error("Error", { description: error.message || "Failed to resend invitation" });
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

      toast.success("Success", { description: "Invitation accepted" });
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      toast.error("Error", { description: error.message || "Failed to accept invitation" });
    }
  };

  const declineInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from("team_invitations")
        .update({ status: "declined" })
        .eq("id", invitationId);

      if (error) throw error;

      toast.success("Success", { description: "Invitation declined" });
    } catch (error) {
      console.error("Error declining invitation:", error);
      toast.error("Error", { description: "Failed to decline invitation" });
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
