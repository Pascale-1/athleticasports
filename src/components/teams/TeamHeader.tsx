import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Lock, Globe, Settings, LogOut } from "lucide-react";
import { Team } from "@/lib/teams";
import { useNavigate } from "react-router-dom";

interface TeamHeaderProps {
  team: Team;
  memberCount: number;
  userRole: string | null;
  canManage: boolean;
  onLeaveTeam: () => void;
}

const roleColors: Record<string, string> = {
  owner: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900 dark:text-purple-200",
  admin: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200",
  coach: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200",
  member: "bg-muted text-muted-foreground border-border",
};

export const TeamHeader = ({ team, memberCount, userRole, canManage, onLeaveTeam }: TeamHeaderProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation('teams');

  return (
    <div className="border-b bg-card overflow-hidden">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-full">
        <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 max-w-full">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 w-full md:flex-1 min-w-0">
            <Avatar className="h-16 w-16 md:h-20 md:w-20 flex-shrink-0">
              <AvatarImage src={team.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl md:text-2xl">
                {team.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="w-full text-center sm:text-left min-w-0">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 mb-2 max-w-full">
                <h1 className="text-2xl md:text-3xl font-bold break-words max-w-full min-w-0">{team.name}</h1>
                {team.is_private ? (
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Lock className="h-3 w-3" />
                    {t('header.private')}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Globe className="h-3 w-3" />
                    {t('header.public')}
                  </Badge>
                )}
              </div>
              {team.description && (
                <p className="text-sm sm:text-base text-muted-foreground mb-2 line-clamp-2 break-words">{team.description}</p>
              )}
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{t('header.membersCount', { count: memberCount })}</span>
                </div>
                {userRole && (
                  <Badge variant="outline" className={`${roleColors[userRole]} text-xs`}>
                    {t(`roles.${userRole}`)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            {canManage && (
              <Button variant="outline" onClick={() => navigate(`/teams/${team.id}/settings`)} className="w-full sm:w-auto min-h-11">
                <Settings className="h-4 w-4 mr-2" />
                <span className="text-xs sm:text-sm">{t('actions.settings')}</span>
              </Button>
            )}
            {userRole && userRole !== "owner" && (
              <Button variant="outline" onClick={onLeaveTeam} className="w-full sm:w-auto min-h-11">
                <LogOut className="h-4 w-4 mr-2" />
                <span className="text-xs sm:text-sm">{t('actions.leave')}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
