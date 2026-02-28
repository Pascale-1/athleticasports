import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("common");
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
    { label: t("performance.levels.beginner"), level: 1, count: stats.level1, icon: Star, color: "text-primary" },
    { label: t("performance.levels.intermediate"), level: 2, count: stats.level2, icon: TrendingUp, color: "text-success" },
    { label: t("performance.levels.advanced"), level: 3, count: stats.level3, icon: Users, color: "text-primary" },
    { label: t("performance.levels.expert"), level: 4, count: stats.level4, icon: Target, color: "text-muted-foreground" },
  ];

  return (
    <div className="space-y-6">
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
                <CardTitle className="text-xl sm:text-2xl font-bold">{stat.count}</CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="body-small text-subtle">{stat.label}</p>
                <p className="text-xs text-muted-foreground">
                  {((stat.count / stats.total) * 100).toFixed(0)}% {t("performance.ofTeam")}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("performance.title")}</CardTitle>
              <CardDescription>
                {canManage ? t("performance.manageLevels") : t("performance.viewLevels")}
              </CardDescription>
            </div>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("performance.allLevels")}</SelectItem>
                <SelectItem value="1">{t("performance.levels.beginner")}</SelectItem>
                <SelectItem value="2">{t("performance.levels.intermediate")}</SelectItem>
                <SelectItem value="3">{t("performance.levels.advanced")}</SelectItem>
                <SelectItem value="4">{t("performance.levels.expert")}</SelectItem>
                <SelectItem value="unassigned">{t("performance.unassigned")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">{t("actions.loading")}</p>
          ) : filteredMembers.length === 0 ? (
            <p className="text-muted-foreground">{t("performance.noMembers")}</p>
          ) : (
            <div className="space-y-3">
              {filteredMembers.map((member) => {
                const level = getLevelForUser(member.user_id);
                return (
                  <div key={member.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
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
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">@{member.profile.username}</p>
                      </div>
                      <Badge variant="secondary" className="flex-shrink-0">{member.role}</Badge>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                      <PerformanceLevelBadge level={level} />
                      {canManage && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="min-w-[70px]"
                          onClick={() => setDialogPlayer({
                            userId: member.user_id,
                            username: member.profile.username,
                            displayName: member.profile.display_name,
                            avatarUrl: member.profile.avatar_url,
                            currentLevel: level,
                          })}
                        >
                          {level ? t("actions.edit") : t("performance.assign")}
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
