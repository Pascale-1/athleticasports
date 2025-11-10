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
    <Card 
      variant="elevated" 
      className="cursor-pointer group hover:shadow-glow transition-all active:scale-[0.98]" 
      onClick={() => navigate(`/teams/${team.id}`)}
    >
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <Avatar 
              size="lg" 
              ring="coral"
              className="flex-shrink-0 group-hover:scale-110 transition-transform"
            >
              <AvatarImage src={team.avatar_url || undefined} />
              <AvatarFallback className="text-sm font-bold">
                {team.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg group-hover:text-primary transition-colors">
                <span className="truncate">{team.name}</span>
                {team.is_private ? (
                  <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <Globe className="h-4 w-4 text-teal flex-shrink-0" />
                )}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1.5">
                <Users className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm text-muted-foreground font-medium">{memberCount} members</span>
              </div>
            </div>
          </div>
          {isMember && (
            <Badge variant="gold" size="sm" className="flex-shrink-0">
              Member
            </Badge>
          )}
        </div>
      </CardHeader>
      {team.description && (
        <CardContent className="p-4 sm:p-6 pt-0">
          <CardDescription className="line-clamp-2 text-sm leading-relaxed">
            {team.description}
          </CardDescription>
        </CardContent>
      )}
    </Card>
  );
};
