import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuickTeamCreateDialog } from "./QuickTeamCreateDialog";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { getSportById } from "@/lib/sports";

interface Team {
  id: string;
  name: string;
  sport: string | null;
  avatar_url: string | null;
  member_count?: number;
}

interface TeamSelectorProps {
  onSelect: (teamId: string, teamName: string, teamLogo?: string) => void;
  selectedTeamId?: string;
  selectedTeamName?: string;
  excludeTeamId?: string;
  placeholder?: string;
  label?: string;
  sportFilter?: string;
  showCreateButton?: boolean;
  /** Called when user taps "Type manually" in the sheet footer */
  onSwitchToManual?: () => void;
}

export const TeamSelector = ({
  onSelect,
  selectedTeamId,
  selectedTeamName,
  excludeTeamId,
  placeholder,
  label,
  sportFilter,
  showCreateButton = true,
  onSwitchToManual,
}: TeamSelectorProps) => {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.split('-')[0] || 'en') as 'en' | 'fr';
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTeams();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [search, sportFilter, excludeTeamId]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("teams")
        .select(`id, name, sport, avatar_url`)
        .eq("is_private", false)
        .order("name");

      if (search) {
        query = query.ilike("name", `%${search}%`);
      }
      if (sportFilter) {
        query = query.eq("sport", sportFilter);
      }
      if (excludeTeamId) {
        query = query.neq("id", excludeTeamId);
      }

      const { data, error } = await query.limit(10);
      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error("Error fetching teams:", error);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const getSportLabel = (sportId: string | null): string => {
    if (!sportId) return '';
    const sport = getSportById(sportId);
    return sport ? sport.label[lang] : sportId;
  };

  const handleTeamCreated = (teamId: string, teamName: string, teamLogo?: string) => {
    const newTeam = {
      id: teamId,
      name: teamName,
      sport: null,
      avatar_url: teamLogo || null,
    };
    setTeams(prev => [newTeam, ...prev]);
    fetchTeams();
    onSelect(teamId, teamName, teamLogo);
    setShowCreateDialog(false);
    setDrawerOpen(false);
  };

  const handleSelectTeam = (team: Team) => {
    onSelect(team.id, team.name, team.avatar_url || undefined);
    setDrawerOpen(false);
  };

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);
  const displayName = selectedTeam?.name || selectedTeamName;

  return (
    <>
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center gap-3 min-h-[36px] text-left"
          >
            {selectedTeamId && displayName ? (
              <>
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  {selectedTeam?.avatar_url ? (
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={selectedTeam.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {displayName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <span className="text-primary text-sm font-semibold">
                      {displayName.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="flex-1 text-sm font-semibold text-foreground break-words">
                  {displayName}
                </span>
              </>
            ) : (
              <span className="flex-1 text-sm text-muted-foreground">
                {placeholder || (lang === 'fr' ? 'Choisir une équipe' : 'Pick a team')}
              </span>
            )}
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        </DrawerTrigger>

        <DrawerContent className="bg-card rounded-t-2xl">
          <div className="p-4 space-y-3">
            {label && <p className="text-sm font-medium">{label}</p>}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ex: FC City Rivals..."
                className="w-full rounded-xl bg-background border border-border/50 px-4 pl-10 h-11 text-sm outline-none placeholder:text-muted-foreground/50 focus:border-primary transition-colors"
              />
            </div>

            {/* Team list */}
            <div className="max-h-[50vh] overflow-y-auto -mx-4">
              {loading ? (
                <div className="p-4 space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : teams.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {lang === 'fr' ? 'Aucune équipe trouvée' : 'No teams found'}
                </div>
              ) : (
                teams.map((team) => (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => handleSelectTeam(team)}
                    className={cn(
                      "w-full h-16 px-4 border-b border-border flex items-center gap-3 transition-colors",
                      selectedTeamId === team.id && "border-l-[3px] border-l-primary bg-primary/5"
                    )}
                  >
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      {team.avatar_url ? (
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={team.avatar_url} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                            {team.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <span className="text-primary text-sm font-semibold">
                          {team.name.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-semibold text-sm text-foreground break-words">
                        {team.name}
                      </p>
                      {team.sport && (
                        <p className="text-xs text-muted-foreground">{getSportLabel(team.sport)}</p>
                      )}
                    </div>
                    {selectedTeamId === team.id && <Check className="h-5 w-5 text-primary shrink-0" />}
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="pt-2 flex flex-col items-center gap-2">
              {onSwitchToManual && (
                <button
                  type="button"
                  onClick={() => {
                    onSwitchToManual();
                    setDrawerOpen(false);
                  }}
                  className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                >
                  {lang === 'fr' ? 'Saisir manuellement' : 'Type manually'}
                </button>
              )}
              {showCreateButton && (
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    setShowCreateDialog(true);
                  }}
                  className="text-primary text-sm font-medium"
                >
                  {lang === 'fr' ? "Équipe introuvable ? Créez-en une" : "Can't find your team? Create one"}
                </button>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <QuickTeamCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onTeamCreated={handleTeamCreated}
        defaultSport={sportFilter}
      />
    </>
  );
};
