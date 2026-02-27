import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getSportById } from "@/lib/sports";
import { AlertCircle, Plus, Globe, ChevronRight, Check, Search } from "lucide-react";
import { QuickTeamCreateDialog } from "./QuickTeamCreateDialog";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

interface Team {
  id: string;
  name: string;
  sport: string | null;
  avatar_url: string | null;
}

interface MyTeamSelectorProps {
  value: string | null;
  onChange: (teamId: string | null, teamName?: string) => void;
  sportFilter?: string;
  label?: string;
  placeholder?: string;
  optional?: boolean;
  disabled?: boolean;
  forEventCreation?: boolean;
  showCreateButton?: boolean;
  onTeamCreated?: (teamId: string, teamName: string) => void;
  showPickupOption?: boolean;
  hideLabel?: boolean;
}

export const MyTeamSelector = ({
  value,
  onChange,
  sportFilter,
  label,
  placeholder,
  optional = true,
  disabled = false,
  forEventCreation = false,
  showCreateButton = false,
  onTeamCreated,
  showPickupOption = false,
  hideLabel = false,
}: MyTeamSelectorProps) => {
  const { t, i18n } = useTranslation(['teams', 'common', 'events']);
  const lang = (i18n.language?.split('-')[0] || 'en') as 'en' | 'fr';
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [allMyTeams, setAllMyTeams] = useState<Team[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchMyTeams = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setTeams([]);
          setAllMyTeams([]);
          return;
        }

        let myTeams: Team[] = [];

        if (forEventCreation) {
          const { data, error } = await supabase
            .from("team_members")
            .select(`
              team_id,
              teams!inner(id, name, sport, avatar_url),
              team_member_roles!inner(role)
            `)
            .eq("user_id", user.id)
            .eq("status", "active")
            .in("team_member_roles.role", ['owner', 'admin', 'coach']);

          if (error) throw error;
          myTeams = data?.map((item: any) => item.teams as Team) || [];
        } else {
          const { data, error } = await supabase
            .from("team_members")
            .select("team_id, teams!inner(id, name, sport, avatar_url)")
            .eq("user_id", user.id)
            .eq("status", "active");

          if (error) throw error;
          myTeams = data?.map((item: any) => item.teams as Team) || [];
        }

        setAllMyTeams(myTeams);

        if (sportFilter) {
          const filteredTeams = myTeams.filter((team) => matchesSport(team.sport, sportFilter));
          setTeams(filteredTeams);
        } else {
          setTeams(myTeams);
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
        setTeams([]);
        setAllMyTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyTeams();
  }, [sportFilter, forEventCreation]);

  const matchesSport = (teamSport: string | null, filterSport: string): boolean => {
    if (!teamSport || !filterSport) return false;
    const teamSportLower = teamSport.toLowerCase();
    const filterLower = filterSport.toLowerCase();
    if (teamSportLower === filterLower) return true;
    const sport = getSportById(filterSport);
    if (sport) {
      if (teamSportLower === sport.id.toLowerCase()) return true;
      if (teamSportLower === sport.label.en.toLowerCase()) return true;
      if (teamSportLower === sport.label.fr.toLowerCase()) return true;
    }
    if ((filterLower === 'football' || filterLower === 'soccer') && 
        (teamSportLower === 'football' || teamSportLower === 'soccer')) {
      return true;
    }
    return false;
  };

  const handleSelect = (teamId: string) => {
    if (teamId === "__pickup__") {
      onChange(null, undefined);
    } else {
      const team = teams.find((t) => t.id === teamId);
      onChange(teamId, team?.name);
    }
    setDrawerOpen(false);
  };

  const getSportLabel = (sportId: string | null): string => {
    if (!sportId) return '';
    const sport = getSportById(sportId);
    return sport ? sport.label[lang] : sportId;
  };

  const handleTeamCreated = (teamId: string, teamName: string) => {
    const newTeam: Team = {
      id: teamId,
      name: teamName,
      sport: sportFilter || null,
      avatar_url: null,
    };
    setTeams(prev => [...prev, newTeam]);
    setAllMyTeams(prev => [...prev, newTeam]);
    onChange(teamId, teamName);
    onTeamCreated?.(teamId, teamName);
    setShowCreateDialog(false);
  };

  const showNoMatchingTeams = sportFilter && teams.length === 0 && allMyTeams.length > 0 && !loading;
  const showNoTeamsAtAll = teams.length === 0 && allMyTeams.length === 0 && !loading;
  const showCreatePrompt = showCreateButton && (showNoTeamsAtAll || showNoMatchingTeams);

  const selectedTeam = teams.find((t) => t.id === value);

  const filteredTeams = searchQuery
    ? teams.filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : teams;

  return (
    <div className="space-y-2">
      {label && !hideLabel && <Label className="text-xs">{label}</Label>}
      
      {loading ? (
        <Skeleton className="h-10 w-full" />
      ) : showCreatePrompt ? (
        <div className="flex flex-col gap-3 p-4 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-muted-foreground">
                {showNoTeamsAtAll
                  ? (lang === 'fr' 
                    ? "Vous n'avez pas encore d'équipe."
                    : "You don't have any teams yet.")
                  : (lang === 'fr' 
                    ? `Aucune de vos équipes n'est configurée pour ${getSportLabel(sportFilter)}.`
                    : `None of your teams are set to ${getSportLabel(sportFilter)}.`)
                }
              </p>
            </div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4" />
            {showNoTeamsAtAll
              ? (lang === 'fr' ? 'Créer votre première équipe' : 'Create your first team')
              : (lang === 'fr' ? `Créer une équipe ${getSportLabel(sportFilter)}` : `Create ${getSportLabel(sportFilter)} Team`)
            }
          </Button>
          
          {showPickupOption && (
            <>
              <div className="relative flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex-1 border-t border-muted-foreground/20" />
                <span>{lang === 'fr' ? 'ou' : 'or'}</span>
                <div className="flex-1 border-t border-muted-foreground/20" />
              </div>
              <Button
                type="button"
                variant="secondary"
                className="w-full gap-2"
                onClick={() => onChange(null, undefined)}
              >
                <Globe className="h-4 w-4" />
                {lang === 'fr' ? 'Partie ouverte (sans équipe)' : 'Pickup Game (no team)'}
              </Button>
            </>
          )}
        </div>
      ) : (
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild disabled={disabled}>
            <button
              type="button"
              className="w-full flex items-center gap-3 min-h-[36px] text-left"
              disabled={disabled}
            >
              {selectedTeam ? (
                <>
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    {selectedTeam.avatar_url ? (
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={selectedTeam.avatar_url} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                          {selectedTeam.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <span className="text-primary text-sm font-semibold">
                        {selectedTeam.name.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="flex-1 text-sm font-semibold text-foreground break-words">
                    {selectedTeam.name}
                  </span>
                </>
              ) : (
                <span className="flex-1 text-sm text-muted-foreground">
                  {placeholder || (lang === 'fr' ? 'Sélectionner une équipe' : 'Select a team')}
                </span>
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          </DrawerTrigger>

          <DrawerContent className="bg-card rounded-t-2xl">
            <div className="p-4 space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ex: FC City Rivals..."
                  className="w-full rounded-xl bg-background border border-border/50 px-4 pl-10 h-11 text-sm outline-none placeholder:text-muted-foreground/50 focus:border-primary transition-colors"
                />
              </div>

              {/* Team list */}
              <div className="max-h-[50vh] overflow-y-auto -mx-4">
                {showPickupOption && (
                  <button
                    type="button"
                    onClick={() => handleSelect("__pickup__")}
                    className={cn(
                      "w-full h-16 px-4 border-b border-border flex items-center gap-3 transition-colors",
                      !value && "border-l-[3px] border-l-primary bg-primary/5"
                    )}
                  >
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Globe className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-semibold text-sm text-foreground">
                        {lang === 'fr' ? 'Partie ouverte' : 'Pickup Game'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {lang === 'fr' ? 'Sans équipe' : 'No team'}
                      </p>
                    </div>
                    {!value && <Check className="h-5 w-5 text-primary shrink-0" />}
                  </button>
                )}

                {filteredTeams.map((team) => (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => handleSelect(team.id)}
                    className={cn(
                      "w-full h-16 px-4 border-b border-border flex items-center gap-3 transition-colors",
                      value === team.id && "border-l-[3px] border-l-primary bg-primary/5"
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
                    {value === team.id && <Check className="h-5 w-5 text-primary shrink-0" />}
                  </button>
                ))}

                {filteredTeams.length === 0 && !showPickupOption && (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    {lang === 'fr' ? 'Aucune équipe trouvée' : 'No teams found'}
                  </div>
                )}
              </div>

              {/* Footer */}
              {showCreateButton && (
                <div className="pt-2 text-center">
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
                </div>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      )}
      
      <QuickTeamCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onTeamCreated={handleTeamCreated}
        defaultSport={sportFilter}
      />
    </div>
  );
};
