import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Team, getUserTeamRole, canManageTeam } from "@/lib/teams";
import { useToast } from "@/hooks/use-toast";

export const useTeam = (teamId: string | null) => {
  const [team, setTeam] = useState<Team | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const { toast } = useToast();

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
        toast({
          title: "Error",
          description: "Failed to load team details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeam();

    const channel = supabase
      .channel(`team-${teamId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "teams",
          filter: `id=eq.${teamId}`,
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setTeam(null);
          } else {
            setTeam(payload.new as Team);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId, toast]);

  return {
    team,
    userRole,
    isLoading,
    isMember,
    canManage,
  };
};
