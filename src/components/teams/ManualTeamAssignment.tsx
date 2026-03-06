import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PerformanceLevelBadge } from "./PerformanceLevelBadge";
import { GeneratedTeam, GeneratedTeamMember } from "@/hooks/useTeamGeneration";
import { Plus, X, UserPlus, Users, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { accentColors } from "./GeneratedTeamCard";

interface PlayerInfo {
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  performance_level: number | null;
}

interface ManualTeamAssignmentProps {
  allPlayers: PlayerInfo[];
  teams: GeneratedTeam[];
  onCreateGroup: () => Promise<string | undefined>;
  onDeleteGroup: (teamId: string) => Promise<void>;
  onAssignPlayer: (teamId: string, player: PlayerInfo) => Promise<void>;
  onRemovePlayer: (memberId: string) => Promise<void>;
  saving: boolean;
}

export const ManualTeamAssignment = ({
  allPlayers,
  teams,
  onCreateGroup,
  onDeleteGroup,
  onAssignPlayer,
  onRemovePlayer,
  saving,
}: ManualTeamAssignmentProps) => {
  const { t } = useTranslation("common");
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerInfo | null>(null);

  // Find unassigned players
  const assignedUserIds = new Set(
    teams.flatMap((team) => team.members.map((m) => m.user_id))
  );
  const unassignedPlayers = allPlayers.filter(
    (p) => !assignedUserIds.has(p.user_id)
  );

  const handlePlayerTap = (player: PlayerInfo) => {
    if (selectedPlayer?.user_id === player.user_id) {
      setSelectedPlayer(null);
    } else {
      setSelectedPlayer(player);
    }
  };

  const handleGroupTap = async (teamId: string) => {
    if (!selectedPlayer) return;
    await onAssignPlayer(teamId, selectedPlayer);
    setSelectedPlayer(null);
  };

  const handleCreateAndAssign = async () => {
    const newTeamId = await onCreateGroup();
    if (newTeamId && selectedPlayer) {
      await onAssignPlayer(newTeamId, selectedPlayer);
      setSelectedPlayer(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Unassigned Players */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t("practiceTeams.unassigned", "Unassigned Players")}
            <Badge variant="secondary" className="ml-auto">
              {unassignedPlayers.length}
            </Badge>
          </CardTitle>
          {selectedPlayer && (
            <p className="text-sm text-primary font-medium animate-pulse">
              {t("practiceTeams.tapGroup", "Tap a group below to assign")}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {unassignedPlayers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t("practiceTeams.allAssigned", "All players assigned!")}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {unassignedPlayers.map((player) => (
                <button
                  key={player.user_id}
                  onClick={() => handlePlayerTap(player)}
                  disabled={saving}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                    "hover:bg-accent/50 active:scale-95",
                    selectedPlayer?.user_id === player.user_id
                      ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                      : "border-border bg-card"
                  )}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={player.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {(player.display_name || player.username)[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {player.display_name || player.username}
                  </span>
                  <PerformanceLevelBadge level={player.performance_level} size="sm" />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {teams.map((team, idx) => (
          <Card
            key={team.id}
            onClick={() => handleGroupTap(team.id)}
            className={cn(
              "border-l-4 transition-all",
              accentColors[idx % accentColors.length],
              selectedPlayer
                ? "cursor-pointer hover:ring-2 hover:ring-primary/40 hover:bg-accent/30"
                : ""
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{team.team_name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {team.members.length} {team.members.length === 1 ? "player" : "players"}
                  </Badge>
                  {selectedPlayer && (
                    <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center">
                      <UserPlus className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                  {!selectedPlayer && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteGroup(team.id);
                      }}
                      disabled={saving}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {team.members.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">
                  {selectedPlayer
                    ? t("practiceTeams.tapToAdd", "Tap to add selected player")
                    : t("practiceTeams.emptyGroup", "No players yet")}
                </p>
              ) : (
                <div className="space-y-1.5">
                  {team.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member.profiles?.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {(member.profiles?.display_name || member.profiles?.username || "?")[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {member.profiles?.display_name || member.profiles?.username}
                        </span>
                        <PerformanceLevelBadge level={member.performance_level} size="sm" />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemovePlayer(member.id);
                        }}
                        disabled={saving}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Add new group button */}
        <Card
          onClick={selectedPlayer ? handleCreateAndAssign : () => onCreateGroup()}
          className={cn(
            "border-dashed border-2 cursor-pointer hover:bg-accent/30 transition-all",
            "flex items-center justify-center min-h-[120px]"
          )}
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Plus className="h-6 w-6" />
            <span className="text-sm font-medium">
              {selectedPlayer
                ? t("practiceTeams.newGroupWithPlayer", "New group + assign")
                : t("practiceTeams.addGroup", "Add Group")}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};
