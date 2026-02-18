import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getSportById } from "@/lib/sports";
import { Link } from "react-router-dom";
import { AlertCircle, Plus, Users, Globe } from "lucide-react";
import { QuickTeamCreateDialog } from "./QuickTeamCreateDialog";

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
  /** When true, only shows teams user can create events for (owner/admin/coach) */
  forEventCreation?: boolean;
  /** Show "Create Team" button when no teams available */
  showCreateButton?: boolean;
  /** Callback when a new team is created */
  onTeamCreated?: (teamId: string, teamName: string) => void;
  /** Show pickup game option for match events */
  showPickupOption?: boolean;
  /** When true, suppress the label element — value/placeholder shown only in trigger */
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
          // Fetch teams where user has management permissions (owner/admin/coach)
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
          // Fetch all teams where user is an active member
          const { data, error } = await supabase
            .from("team_members")
            .select("team_id, teams!inner(id, name, sport, avatar_url)")
            .eq("user_id", user.id)
            .eq("status", "active");

          if (error) throw error;
          myTeams = data?.map((item: any) => item.teams as Team) || [];
        }

        setAllMyTeams(myTeams);

        // Filter by sport if specified
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

  // Case-insensitive sport matching that handles ID/label variations
  const matchesSport = (teamSport: string | null, filterSport: string): boolean => {
    if (!teamSport || !filterSport) return false;
    
    const teamSportLower = teamSport.toLowerCase();
    const filterLower = filterSport.toLowerCase();
    
    // Direct match
    if (teamSportLower === filterLower) return true;
    
    // Get the sport by ID and check labels
    const sport = getSportById(filterSport);
    if (sport) {
      if (teamSportLower === sport.id.toLowerCase()) return true;
      if (teamSportLower === sport.label.en.toLowerCase()) return true;
      if (teamSportLower === sport.label.fr.toLowerCase()) return true;
    }
    
    // Handle soccer/football alias
    if ((filterLower === 'football' || filterLower === 'soccer') && 
        (teamSportLower === 'football' || teamSportLower === 'soccer')) {
      return true;
    }
    
    return false;
  };

  const handleChange = (teamId: string) => {
    if (teamId === "__none__") {
      onChange(null, undefined);
    } else if (teamId === "__pickup__") {
      onChange(null, undefined);
    } else {
      const team = teams.find((t) => t.id === teamId);
      onChange(teamId, team?.name);
    }
  };

  const getSportLabel = (sportId: string | null): string => {
    if (!sportId) return '';
    const sport = getSportById(sportId);
    return sport ? sport.label[lang] : sportId;
  };

  const handleTeamCreated = (teamId: string, teamName: string) => {
    // Add the new team to our list
    const newTeam: Team = {
      id: teamId,
      name: teamName,
      sport: sportFilter || null,
      avatar_url: null,
    };
    setTeams(prev => [...prev, newTeam]);
    setAllMyTeams(prev => [...prev, newTeam]);
    
    // Select the newly created team
    onChange(teamId, teamName);
    
    // Call external callback if provided
    onTeamCreated?.(teamId, teamName);
    
    setShowCreateDialog(false);
  };

  // Show message if sport filter is applied but no matching teams
  const showNoMatchingTeams = sportFilter && teams.length === 0 && allMyTeams.length > 0 && !loading;
  const showNoTeamsAtAll = teams.length === 0 && allMyTeams.length === 0 && !loading;

  // Determine if we should show the create team prompt
  const showCreatePrompt = showCreateButton && (showNoTeamsAtAll || showNoMatchingTeams);

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
        <Select
          value={value || (showPickupOption ? "__pickup__" : undefined)}
          onValueChange={handleChange}
          disabled={disabled || (teams.length === 0 && !showPickupOption)}
        >
          <SelectTrigger className="h-9 text-sm border-0 bg-transparent shadow-none px-0 focus:ring-0 text-foreground hover:text-primary transition-colors">
            <SelectValue placeholder={placeholder || (lang === 'fr' ? 'Sélectionner une équipe' : 'Select a team')} />
          </SelectTrigger>
          <SelectContent className="bg-background" onCloseAutoFocus={(e) => e.preventDefault()}>
            {/* Pickup Game Option - only for match type */}
            {showPickupOption && (
              <SelectItem value="__pickup__">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-accent/20 flex items-center justify-center">
                    <Globe className="h-3 w-3 text-accent-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <span>{lang === 'fr' ? 'Partie ouverte (sans équipe)' : 'Pickup Game (no team)'}</span>
                  </div>
                </div>
              </SelectItem>
            )}
            
            {optional && !showPickupOption && (
              <SelectItem value="__none__">
                <span className="text-muted-foreground">
                  {lang === 'fr' ? 'Aucune équipe' : 'No team'}
                </span>
              </SelectItem>
            )}
            
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    {team.avatar_url && <AvatarImage src={team.avatar_url} alt={team.name} />}
                    <AvatarFallback className="text-[10px] bg-primary/10">
                      {team.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{team.name}</span>
                </div>
              </SelectItem>
            ))}
            
            {/* Create Team option at bottom */}
            {showCreateButton && teams.length > 0 && (
              <div className="border-t mt-1 pt-1">
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowCreateDialog(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  {lang === 'fr' ? 'Créer une nouvelle équipe' : 'Create new team'}
                </button>
              </div>
            )}
          </SelectContent>
        </Select>
      )}
      
      {/* Quick Team Create Dialog */}
      <QuickTeamCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onTeamCreated={handleTeamCreated}
        defaultSport={sportFilter}
      />
    </div>
  );
};
