import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TeamMemberWithProfile } from "@/lib/teams";
import { useToast } from "@/hooks/use-toast";

export const useTeamMembers = (teamId: string | null) => {
  const [members, setMembers] = useState<TeamMemberWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMembers = async () => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    try {
      // Single query with JOIN to fetch members, profiles, and roles together
      // This eliminates the N+1 problem (previously: 1 + N queries, now: 1 query)
      const { data: membersData, error } = await supabase
        .from("team_members")
        .select(`
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url
          ),
          team_member_roles (
            role
          )
        `)
        .eq("team_id", teamId)
        .eq("status", "active");

      if (error) throw error;

      const membersWithRoles = membersData.map((member) => {
        // Get the first role from the joined data, default to "member"
        const roles = member.team_member_roles as { role: string }[] | null;
        const role = roles && roles.length > 0 ? roles[0].role : "member";

        return {
          ...member,
          profile: Array.isArray(member.profiles) ? member.profiles[0] : member.profiles,
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

    const channel = supabase
      .channel(`team-members-${teamId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "team_members",
          filter: `team_id=eq.${teamId}`,
        },
        () => {
          fetchMembers();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "team_member_roles",
        },
        () => {
          fetchMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId]);

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member removed from team",
      });

      // Immediately refetch to update member list
      await fetchMembers();
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
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

      toast({
        title: "Success",
        description: "Member role updated",
      });

      // Immediately refetch to show updated role
      await fetchMembers();
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive",
      });
    }
  };

  return {
    members,
    loading,
    removeMember,
    updateMemberRole,
  };
};
