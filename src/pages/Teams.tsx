import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { TeamCard } from "@/components/teams/TeamCard";
import { Plus, Loader2 } from "lucide-react";
import { Team } from "@/lib/teams";

const Teams = () => {
  const navigate = useNavigate();
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [publicTeams, setPublicTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUserId(user?.id || null);

        if (user) {
          const { data: myTeamsData } = await supabase
            .from("team_members")
            .select("team_id, teams(*)")
            .eq("user_id", user.id)
            .eq("status", "active");

          const teams = myTeamsData?.map((item: any) => item.teams).filter(Boolean) || [];
          setMyTeams(teams);

          for (const team of teams) {
            const { data: countData } = await supabase.rpc("get_team_member_count", {
              _team_id: team.id,
            });
            if (countData !== null) {
              setMemberCounts((prev) => ({ ...prev, [team.id]: countData }));
            }
          }
        }

        const { data: publicTeamsData } = await supabase
          .from("teams")
          .select("*")
          .eq("is_private", false)
          .order("created_at", { ascending: false })
          .limit(10);

        setPublicTeams(publicTeamsData || []);

        for (const team of publicTeamsData || []) {
          const { data: countData } = await supabase.rpc("get_team_member_count", {
            _team_id: team.id,
          });
          if (countData !== null) {
            setMemberCounts((prev) => ({ ...prev, [team.id]: countData }));
          }
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-6xl">
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Teams</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
              Create and manage your sports teams
            </p>
          </div>
          <Button onClick={() => navigate("/teams/create")} className="w-full sm:w-auto min-h-11">
            <Plus className="h-4 w-4 mr-2" />
            <span className="text-xs sm:text-sm">Create Team</span>
          </Button>
        </div>

        {myTeams.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">My Teams</h2>
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myTeams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  memberCount={memberCounts[team.id] || 0}
                  isMember={true}
                />
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">Discover Public Teams</h2>
          {publicTeams.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {publicTeams
                .filter((team) => !myTeams.some((myTeam) => myTeam.id === team.id))
                .map((team) => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    memberCount={memberCounts[team.id] || 0}
                    isMember={false}
                  />
                ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-12">
              No public teams available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Teams;
