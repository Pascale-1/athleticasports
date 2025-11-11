import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuickTeamCreateDialog } from "./QuickTeamCreateDialog";

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
  excludeTeamId?: string;
  placeholder?: string;
  label?: string;
  sportFilter?: string;
  showCreateButton?: boolean;
}

export const TeamSelector = ({
  onSelect,
  selectedTeamId,
  excludeTeamId,
  placeholder = "Search teams...",
  label,
  sportFilter,
  showCreateButton = true,
}: TeamSelectorProps) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

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
        .select(`
          id,
          name,
          sport,
          avatar_url
        `)
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

  const handleTeamCreated = (teamId: string, teamName: string, teamLogo?: string) => {
    // Add new team to local state immediately
    const newTeam = {
      id: teamId,
      name: teamName,
      sport: null,
      avatar_url: teamLogo || null,
    };
    setTeams(prev => [newTeam, ...prev]);
    
    // Also refetch to ensure consistency
    fetchTeams();
    
    onSelect(teamId, teamName, teamLogo);
    setShowCreateDialog(false);
  };

  return (
    <>
      <div className="space-y-2">
        {label && <p className="text-sm font-medium">{label}</p>}
        <Command className="border rounded-lg">
          <CommandInput
            placeholder={placeholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {loading ? (
              <div className="p-2 space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <>
                <CommandEmpty>
                  <div className="text-center py-6 space-y-2">
                    <p className="text-sm text-muted-foreground">No teams found</p>
                    {showCreateButton && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCreateDialog(true)}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create team
                      </Button>
                    )}
                  </div>
                </CommandEmpty>
                <CommandGroup>
                  {teams.map((team) => (
                    <CommandItem
                      key={team.id}
                      value={team.id}
                      onSelect={() => onSelect(team.id, team.name, team.avatar_url || undefined)}
                      className="flex items-center gap-3 p-3 cursor-pointer"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={team.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10">
                          {team.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{team.name}</p>
                        {team.sport && (
                          <p className="text-xs text-muted-foreground">{team.sport}</p>
                        )}
                      </div>
                      {selectedTeamId === team.id && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
        {showCreateButton && teams.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowCreateDialog(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Can't find team? Create one
          </Button>
        )}
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