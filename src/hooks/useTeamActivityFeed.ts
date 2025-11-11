import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TeamActivity {
  id: string;
  user_id: string;
  title: string;
  type: string;
  date: string;
  distance: number | null;
  duration: number | null;
  created_at: string;
  profile: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  team_name: string;
}

export const useTeamActivityFeed = () => {
  const [activities, setActivities] = useState<TeamActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamActivities = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get user's teams
        const { data: teamMemberships } = await supabase
          .from("team_members")
          .select("team_id, teams(name)")
          .eq("user_id", user.id)
          .eq("status", "active");

        if (!teamMemberships || teamMemberships.length === 0) {
          setLoading(false);
          return;
        }

        const teamIds = teamMemberships.map(tm => tm.team_id);

        // Get all team members from user's teams
        const { data: allTeamMembers } = await supabase
          .from("team_members")
          .select("user_id, team_id")
          .in("team_id", teamIds)
          .eq("status", "active")
          .neq("user_id", user.id); // Exclude current user

        if (!allTeamMembers || allTeamMembers.length === 0) {
          setLoading(false);
          return;
        }

        const teammateIds = [...new Set(allTeamMembers.map(tm => tm.user_id))];

        // Fetch recent activities from teammates
        const { data: activitiesData, error } = await supabase
          .from("activities")
          .select(`
            id,
            user_id,
            title,
            type,
            date,
            distance,
            duration,
            created_at,
            profiles:user_id (
              username,
              display_name,
              avatar_url
            )
          `)
          .in("user_id", teammateIds)
          .in("visibility", ["public", "team"])
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;

        // Enrich with team names
        const enrichedActivities = activitiesData?.map(activity => {
          const membership = allTeamMembers.find(tm => tm.user_id === activity.user_id);
          const team = teamMemberships.find(tm => tm.team_id === membership?.team_id);
          return {
            ...activity,
            profile: Array.isArray(activity.profiles) ? activity.profiles[0] : activity.profiles,
            team_name: team?.teams?.name || "Unknown Team",
          };
        }) || [];

        setActivities(enrichedActivities as TeamActivity[]);
      } catch (error) {
        console.error("Error fetching team activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamActivities();

    // Set up realtime subscription
    const channel = supabase
      .channel("team-activities")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activities",
        },
        () => {
          fetchTeamActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { activities, loading };
};
