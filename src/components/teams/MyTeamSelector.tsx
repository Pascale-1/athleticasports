import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getSportById } from "@/lib/sports";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";

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
}

export const MyTeamSelector = ({
  value,
  onChange,
  sportFilter,
  label,
  placeholder,
  optional = true,
  disabled = false,
}: MyTeamSelectorProps) => {
  const { t, i18n } = useTranslation(['teams', 'common']);
  const lang = (i18n.language?.split('-')[0] || 'en') as 'en' | 'fr';
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [allMyTeams, setAllMyTeams] = useState<Team[]>([]);

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

        // Fetch teams where user is an active member
        const { data, error } = await supabase
          .from("team_members")
          .select("team_id, teams!inner(id, name, sport, avatar_url)")
          .eq("user_id", user.id)
          .eq("status", "active");

        if (error) throw error;

        // Extract teams from the joined data
        const myTeams = data?.map((item: any) => item.teams as Team) || [];
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
  }, [sportFilter]);

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

  // Show message if sport filter is applied but no matching teams
  const showNoMatchingTeams = sportFilter && teams.length === 0 && allMyTeams.length > 0 && !loading;

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      
      {loading ? (
        <Skeleton className="h-10 w-full" />
      ) : showNoMatchingTeams ? (
        <div className="flex items-start gap-2 p-3 rounded-md border border-muted bg-muted/30">
          <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-muted-foreground">
              {lang === 'fr' 
                ? `Aucune de vos équipes n'est configurée pour ${getSportLabel(sportFilter)}.`
                : `None of your teams are set to ${getSportLabel(sportFilter)}.`
              }
            </p>
            <Link 
              to="/teams" 
              className="text-primary hover:underline text-xs"
            >
              {lang === 'fr' ? 'Gérer mes équipes' : 'Manage my teams'}
            </Link>
          </div>
        </div>
      ) : (
        <Select
          value={value || undefined}
          onValueChange={handleChange}
          disabled={disabled || teams.length === 0}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder={placeholder || (lang === 'fr' ? 'Sélectionner une équipe' : 'Select a team')} />
          </SelectTrigger>
          <SelectContent className="bg-background">
            {optional && (
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
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
