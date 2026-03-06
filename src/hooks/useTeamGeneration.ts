import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeSubscription } from "@/lib/realtimeManager";

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

  // Declare fetchTeams BEFORE it's used
  const fetchTeams = async () => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    try {
      const { data: teamsData, error: teamsError } = await supabase
        .from("event_teams")
        .select("*")
        .eq("event_id", sessionId)
        .order("team_number");

      if (teamsError) throw teamsError;

      if (!teamsData || teamsData.length === 0) {
        setTeams([]);
        setLoading(false);
        return;
      }

      const teamsWithMembers = await Promise.all(
        teamsData.map(async (team) => {
          const { data: membersData, error: membersError } = await supabase
            .from("event_team_members")
            .select("id, user_id, performance_level")
            .eq("event_team_id", team.id);

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

  useEffect(() => {
    fetchTeams();
  }, [sessionId]);

  // Use ref to store fetchTeams for stable callback
  const fetchTeamsRef = useRef(fetchTeams);
  fetchTeamsRef.current = fetchTeams;

  // Realtime subscription using centralized manager
  const handleRealtimeChange = useCallback(() => {
    fetchTeamsRef.current();
  }, []);

  useRealtimeSubscription(
    `session-teams-${sessionId}`,
    [{ table: "event_teams", event: "*", filter: `event_id=eq.${sessionId}` }],
    handleRealtimeChange,
    !!sessionId
  );

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
        .from("event_teams")
        .delete()
        .eq("event_id", sessionId);

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

  // Manual assignment methods
  const createGroup = async (): Promise<string | undefined> => {
    if (!sessionId) return;

    try {
      const nextNumber = teams.length + 1;
      const teamName = `Group ${String.fromCharCode(64 + nextNumber)}`;

      const { data, error } = await supabase
        .from("event_teams")
        .insert({
          event_id: sessionId,
          team_name: teamName,
          team_number: nextNumber,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchTeams();
      return data?.id;
    } catch (error: any) {
      console.error("Error creating group:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create group",
        variant: "destructive",
      });
    }
  };

  const deleteGroup = async (teamId: string) => {
    try {
      const { error } = await supabase
        .from("event_teams")
        .delete()
        .eq("id", teamId);

      if (error) throw error;
      await fetchTeams();
    } catch (error: any) {
      console.error("Error deleting group:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete group",
        variant: "destructive",
      });
    }
  };

  const assignPlayer = async (
    teamId: string,
    player: { user_id: string; performance_level: number | null }
  ) => {
    try {
      const { error } = await supabase
        .from("event_team_members")
        .insert({
          event_team_id: teamId,
          user_id: player.user_id,
          performance_level: player.performance_level,
        });

      if (error) throw error;
      await fetchTeams();
    } catch (error: any) {
      console.error("Error assigning player:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign player",
        variant: "destructive",
      });
    }
  };

  const removePlayer = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from("event_team_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
      await fetchTeams();
    } catch (error: any) {
      console.error("Error removing player:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove player",
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
    createGroup,
    deleteGroup,
    assignPlayer,
    removePlayer,
  };
};
