import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PerformanceLevelBadge } from "./PerformanceLevelBadge";
import { AssignLevelDialog } from "./AssignLevelDialog";
import { usePerformanceLevels } from "@/hooks/usePerformanceLevels";
import { TeamMemberWithProfile } from "@/lib/teams";
import { Star, TrendingUp, Users, Target } from "lucide-react";

interface PerformanceLevelsTabProps {
  teamId: string;
  members: TeamMemberWithProfile[];
  canManage: boolean;
}

export const PerformanceLevelsTab = ({ teamId, members, canManage }: PerformanceLevelsTabProps) => {
  const { levels, loading, assignLevel, getLevelForUser, getLevelStats } = usePerformanceLevels(teamId);
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [dialogPlayer, setDialogPlayer] = useState<{
    userId: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    currentLevel: number | null;
  } | null>(null);

  const stats = getLevelStats(members.length);

  const filteredMembers = members.filter((member) => {
    if (selectedLevel === "all") return true;
    if (selectedLevel === "unassigned") return !getLevelForUser(member.user_id);
    return getLevelForUser(member.user_id) === parseInt(selectedLevel);
  });

  const statsCards = [
    { label: "Elite", level: 1, count: stats.level1, icon: Star, color: "text-amber-600" },
    { label: "Advanced", level: 2, count: stats.level2, icon: TrendingUp, color: "text-green-600" },
    { label: "Intermediate", level: 3, count: stats.level3, icon: Users, color: "text-blue-600" },
    { label: "Beginner", level: 4, count: stats.level4, icon: Target, color: "text-gray-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.level} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 space-y-0">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                  <PerformanceLevelBadge level={stat.level} size="sm" />
                </div>
                <CardTitle className="text-xl sm:text-2xl font-bold">
                  {stat.count}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="body-small text-subtle">
                  {stat.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {((stat.count / stats.total) * 100).toFixed(0)}% of team
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter and Members List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Performance Levels</CardTitle>
              <CardDescription>
                {canManage
                  ? "Assign and manage performance levels for team members"
                  : "View performance levels for team members"}
              </CardDescription>
            </div>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="1">Level 1</SelectItem>
                <SelectItem value="2">Level 2</SelectItem>
                <SelectItem value="3">Level 3</SelectItem>
                <SelectItem value="4">Level 4</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : filteredMembers.length === 0 ? (
            <p className="text-muted-foreground">No members found</p>
          ) : (
            <div className="space-y-3">
              {filteredMembers.map((member) => {
                const level = getLevelForUser(member.user_id);
                return (
                  <div
                    key={member.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    {/* User Info Section */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar className="flex-shrink-0">
                        <AvatarImage src={member.profile.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {member.profile.display_name?.[0] || member.profile.username[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">
                          {member.profile.display_name || member.profile.username}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          @{member.profile.username}
                        </p>
                      </div>
                      <Badge variant="secondary" className="flex-shrink-0">
                        {member.role}
                      </Badge>
                    </div>

                    {/* Actions Section - Separate row on mobile */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                      <PerformanceLevelBadge level={level} />
                      {canManage && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="min-w-[70px]"
                          onClick={() =>
                            setDialogPlayer({
                              userId: member.user_id,
                              username: member.profile.username,
                              displayName: member.profile.display_name,
                              avatarUrl: member.profile.avatar_url,
                              currentLevel: level,
                            })
                          }
                        >
                          {level ? "Edit" : "Assign"}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AssignLevelDialog
        open={!!dialogPlayer}
        onOpenChange={(open) => !open && setDialogPlayer(null)}
        player={dialogPlayer}
        onAssign={assignLevel}
      />
    </div>
  );
};
