import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Globe, Plus, Check } from "lucide-react";
import { QuickTeamCreateDialog } from "@/components/teams/QuickTeamCreateDialog";
import { getSportById } from "@/lib/sports";
import { cn } from "@/lib/utils";

interface Team {
  id: string;
  name: string;
  sport: string | null;
  avatar_url: string | null;
}

interface InlineTeamPillsProps {
  teams: Team[];
  loading: boolean;
  selectedTeamId: string | null;
  onSelect: (teamId: string | null, teamName?: string) => void;
  showPickupOption?: boolean;
  isPickupGame?: boolean;
  lang: 'en' | 'fr';
  sportFilter?: string;
  forEventCreation?: boolean;
  onTeamCreated?: (teamId: string, teamName: string) => void;
}

export const InlineTeamPills = ({
  teams,
  loading,
  selectedTeamId,
  onSelect,
  showPickupOption = false,
  isPickupGame = false,
  lang,
  sportFilter,
  forEventCreation,
  onTeamCreated,
}: InlineTeamPillsProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleTeamCreated = (teamId: string, teamName: string) => {
    onSelect(teamId, teamName);
    onTeamCreated?.(teamId, teamName);
    setShowCreateDialog(false);
  };

  if (loading) {
    return (
      <div className="flex gap-1.5">
        {[1, 2].map(i => (
          <div key={i} className="h-8 w-20 rounded-full bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        {/* Pickup option */}
        {showPickupOption && (
          <button
            type="button"
            onClick={() => onSelect(null, undefined)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150",
              isPickupGame
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
            )}
          >
            <Globe className="h-3 w-3" />
            {lang === 'fr' ? 'Pickup' : 'Pickup'}
          </button>
        )}

        {/* Team pills */}
        {teams.map((team) => (
          <button
            key={team.id}
            type="button"
            onClick={() => onSelect(team.id, team.name)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150",
              selectedTeamId === team.id
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
            )}
          >
            {team.avatar_url ? (
              <Avatar className="h-4 w-4">
                <AvatarImage src={team.avatar_url} />
                <AvatarFallback className="text-[8px] bg-primary/20">
                  {team.name.substring(0, 1)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <span className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold shrink-0">
                {team.name.substring(0, 1)}
              </span>
            )}
            <span className="truncate max-w-[100px]">{team.name}</span>
          </button>
        ))}

        {/* Create team button */}
        <button
          type="button"
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-all duration-150"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      <QuickTeamCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onTeamCreated={handleTeamCreated}
        defaultSport={sportFilter}
      />
    </>
  );
};

// Hook to fetch teams for inline display
export const useInlineTeams = (sportFilter?: string, forEventCreation = true) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setTeams([]); return; }

        let query;
        if (forEventCreation) {
          const { data, error } = await supabase
            .from("team_members")
            .select(`team_id, teams!inner(id, name, sport, avatar_url), team_member_roles!inner(role)`)
            .eq("user_id", user.id)
            .eq("status", "active")
            .in("team_member_roles.role", ['owner', 'admin', 'coach']);
          if (error) throw error;
          const myTeams = data?.map((item: any) => item.teams as Team) || [];
          setTeams(sportFilter ? myTeams.filter(t => matchesSport(t.sport, sportFilter)) : myTeams);
        } else {
          const { data, error } = await supabase
            .from("team_members")
            .select("team_id, teams!inner(id, name, sport, avatar_url)")
            .eq("user_id", user.id)
            .eq("status", "active");
          if (error) throw error;
          const myTeams = data?.map((item: any) => item.teams as Team) || [];
          setTeams(sportFilter ? myTeams.filter(t => matchesSport(t.sport, sportFilter)) : myTeams);
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, [sportFilter, forEventCreation]);

  return { teams, loading, setTeams };
};

const matchesSport = (teamSport: string | null, filterSport: string): boolean => {
  if (!teamSport || !filterSport) return false;
  const tl = teamSport.toLowerCase();
  const fl = filterSport.toLowerCase();
  if (tl === fl) return true;
  const sport = getSportById(filterSport);
  if (sport) {
    if (tl === sport.id.toLowerCase() || tl === sport.label.en.toLowerCase() || tl === sport.label.fr.toLowerCase()) return true;
  }
  if ((fl === 'football' || fl === 'soccer') && (tl === 'football' || tl === 'soccer')) return true;
  return false;
};
