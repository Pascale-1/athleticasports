import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Lock, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Team } from "@/lib/teams";

interface TeamCardProps {
  team: Team;
  memberCount?: number;
  isMember: boolean;
}

export const TeamCard = ({ team, memberCount = 0, isMember }: TeamCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/teams/${team.id}`)}>
      <CardHeader className="p-3 sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Avatar className="h-10 w-10 md:h-12 md:w-12 flex-shrink-0">
              <AvatarImage src={team.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {team.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <CardTitle className="flex items-center gap-1 sm:gap-2 text-base sm:text-lg">
                <span className="truncate">{team.name}</span>
                {team.is_private ? (
                  <Lock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                )}
              </CardTitle>
              <div className="flex items-center gap-1 sm:gap-2 mt-1">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                <span className="text-xs sm:text-sm text-muted-foreground">{memberCount} members</span>
              </div>
            </div>
          </div>
          {isMember && (
            <Badge variant="secondary" className="text-xs flex-shrink-0">Member</Badge>
          )}
        </div>
      </CardHeader>
      {team.description && (
        <CardContent className="p-3 sm:p-6 pt-0">
          <CardDescription className="line-clamp-2 text-xs sm:text-sm">{team.description}</CardDescription>
        </CardContent>
      )}
    </Card>
  );
};
