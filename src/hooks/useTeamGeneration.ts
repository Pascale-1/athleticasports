import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface GeneratedTeamMember {
  id: string;
  user_id: string;
  performance_level: number | null;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface GeneratedTeam {
  id: string;
  team_name: string;
  team_number: number;
  average_level: number;
  members: GeneratedTeamMember[];
}

export const useTeamGeneration = (sessionId: string | null) => {
  const [teams, setTeams] = useState<GeneratedTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    const fetchTeams = async () => {
      try {
        const { data: teamsData, error: teamsError } = await supabase
          .from("training_session_teams")
          .select("*")
          .eq("training_session_id", sessionId)
          .order("team_number");

        if (teamsError) throw teamsError;

        if (!teamsData || teamsData.length === 0) {
          setTeams([]);
          return;
        }

        const teamsWithMembers = await Promise.all(
          teamsData.map(async (team) => {
            const { data: membersData, error: membersError } = await supabase
              .from("training_session_team_members")
              .select("id, user_id, performance_level")
              .eq("session_team_id", team.id);

            if (membersError) throw membersError;

            // Fetch profiles for members
            const userIds = membersData?.map(m => m.user_id) || [];
            const { data: profilesData, error: profilesError } = await supabase
              .from("profiles")
              .select("user_id, username, display_name, avatar_url")
              .in("user_id", userIds);

            if (profilesError) throw profilesError;

            // Merge profiles with members
            const profileMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
            const membersWithProfiles = (membersData || []).map(member => ({
              ...member,
              profiles: profileMap.get(member.user_id) || {
                username: "Unknown",
                display_name: null,
                avatar_url: null,
              },
            }));

            return {
              ...team,
              members: membersWithProfiles,
            };
          })
        );

        setTeams(teamsWithMembers as GeneratedTeam[]);
      } catch (error) {
        console.error("Error fetching teams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();

    const channel = supabase
      .channel(`session-teams-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "training_session_teams",
          filter: `training_session_id=eq.${sessionId}`,
        },
        () => {
          fetchTeams();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const generateTeams = async (numTeams: number) => {
    if (!sessionId) return;

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-balanced-teams",
        {
          body: { sessionId, numTeams },
        }
      );

      if (error) throw error;

      toast({
        title: "Success",
        description: `Generated ${numTeams} balanced teams`,
      });

      return data;
    } catch (error: any) {
      console.error("Error generating teams:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate teams",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const deleteTeams = async () => {
    if (!sessionId) return;

    try {
      const { error } = await supabase
        .from("training_session_teams")
        .delete()
        .eq("training_session_id", sessionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Teams cleared",
      });
    } catch (error: any) {
      console.error("Error deleting teams:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete teams",
        variant: "destructive",
      });
    }
  };

  return {
    teams,
    loading,
    generating,
    generateTeams,
    deleteTeams,
  };
};
