import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TeamMemberWithProfile } from "@/lib/teams";
import { toast } from "sonner";
import { useRealtimeSubscription } from "@/lib/realtimeManager";

export const useTeamMembers = (teamId: string | null) => {
  const [members, setMembers] = useState<TeamMemberWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    try {
      const { data: membersData, error } = await supabase
        .from("team_members")
        .select(`
          *,
          team_member_roles (
            role
          )
        `)
        .eq("team_id", teamId)
        .eq("status", "active");

      if (error) throw error;

      const userIds = membersData.map((m) => m.user_id);
      let profilesMap: Record<string, { username: string; display_name: string | null; avatar_url: string | null }> = {};

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles_public")
          .select("user_id, username, display_name, avatar_url")
          .in("user_id", userIds);

        if (profiles) {
          profilesMap = Object.fromEntries(
            profiles.map((p) => [p.user_id, { username: p.username || "unknown", display_name: p.display_name, avatar_url: p.avatar_url }])
          );
        }
      }

      const membersWithRoles = membersData.map((member) => {
        const roles = member.team_member_roles as { role: string }[] | null;
        const role = roles && roles.length > 0 ? roles[0].role : "member";
        const profile = profilesMap[member.user_id] || { username: "unknown", display_name: null, avatar_url: null };

        return {
          ...member,
          profile,
          role,
        };
      });

      setMembers(membersWithRoles as TeamMemberWithProfile[]);
    } catch (error) {
      console.error("Error fetching team members:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [teamId]);

  const fetchMembersRef = useRef(fetchMembers);
  fetchMembersRef.current = fetchMembers;

  const handleRealtimeChange = useCallback(() => {
    fetchMembersRef.current();
  }, []);

  useRealtimeSubscription(
    `team-members-${teamId}`,
    [
      { table: "team_members", event: "*", filter: `team_id=eq.${teamId}` },
      { table: "team_member_roles", event: "*" },
    ],
    handleRealtimeChange,
    !!teamId
  );

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      toast.success("Success", { description: "Member removed from team" });
      await fetchMembers();
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Error", { description: "Failed to remove member" });
    }
  };

  const updateMemberRole = async (memberId: string, newRole: "owner" | "admin" | "coach" | "member") => {
    try {
      await supabase
        .from("team_member_roles")
        .delete()
        .eq("team_member_id", memberId);

      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("team_member_roles")
        .insert([{
          team_member_id: memberId,
          role: newRole,
          assigned_by: user?.id,
        }]);

      if (error) throw error;

      toast.success("Success", { description: "Member role updated" });
      await fetchMembers();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Error", { description: "Failed to update member role" });
    }
  };

  return {
    members,
    loading,
    removeMember,
    updateMemberRole,
  };
};
