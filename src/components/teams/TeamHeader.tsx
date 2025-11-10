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

  return (
    <div className="border-b bg-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={team.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {team.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{team.name}</h1>
                {team.is_private ? (
                  <Badge variant="outline" className="gap-1">
                    <Lock className="h-3 w-3" />
                    Private
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <Globe className="h-3 w-3" />
                    Public
                  </Badge>
                )}
              </div>
              {team.description && (
                <p className="text-muted-foreground mb-2">{team.description}</p>
              )}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{memberCount} members</span>
                </div>
                {userRole && (
                  <Badge variant="outline" className={roleColors[userRole]}>
                    {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {canManage && (
              <Button variant="outline" onClick={() => navigate(`/teams/${team.id}/settings`)}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            )}
            {userRole && userRole !== "owner" && (
              <Button variant="outline" onClick={onLeaveTeam}>
                <LogOut className="h-4 w-4 mr-2" />
                Leave Team
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
