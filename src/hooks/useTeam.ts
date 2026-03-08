import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Team, getUserTeamRole, canManageTeam } from "@/lib/teams";
import { toast } from "sonner";
import { useRealtimeSubscription } from "@/lib/realtimeManager";

export const useTeam = (teamId: string | null) => {
  const [team, setTeam] = useState<Team | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    if (!teamId) {
      setIsLoading(false);
      return;
    }

    const fetchTeam = async () => {
      try {
        const { data: teamData, error: teamError } = await supabase
          .from("teams")
          .select("*")
          .eq("id", teamId)
          .single();

        if (teamError) throw teamError;
        setTeam(teamData);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const role = await getUserTeamRole(user.id, teamId);
          setUserRole(role);
          setIsMember(!!role);
          
          const hasManagePermission = await canManageTeam(user.id, teamId);
          setCanManage(hasManagePermission);
        }
      } catch (error) {
        console.error("Error fetching team:", error);
        toast.error("Error", { description: "Failed to load team details" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeam();
  }, [teamId]);

  const handleRealtimeChange = useCallback((payload: any) => {
    if (payload.eventType === "DELETE") {
      setTeam(null);
    } else {
      setTeam(payload.new as Team);
    }
  }, []);

  useRealtimeSubscription(
    `team-${teamId}`,
    [{ table: "teams", event: "*", filter: `id=eq.${teamId}` }],
    handleRealtimeChange,
    !!teamId
  );

  const canViewPerformance = canManage || userRole === 'coach';

  return {
    team,
    userRole,
    isLoading,
    isMember,
    canManage,
    canViewPerformance,
  };
};
