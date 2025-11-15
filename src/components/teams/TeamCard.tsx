import { memo } from "react";
import { Card } from "@/components/ui/card";
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

export const TeamCard = memo(({ team, memberCount = 0, isMember }: TeamCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="cursor-pointer group hover:shadow-lg transition-all active:scale-[0.98] flex items-center gap-4 p-4" 
      onClick={() => navigate(`/teams/${team.id}`)}
    >
      <Avatar 
        className="h-16 w-16 flex-shrink-0 group-hover:scale-105 transition-transform"
      >
        <AvatarImage src={team.avatar_url || undefined} />
        <AvatarFallback className="text-lg font-bold">
          {team.name.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-bold truncate group-hover:text-primary transition-colors">
          {team.name}
        </h3>
        <div className="flex items-center gap-2 flex-wrap mt-1.5">
          {team.sport && (
            <Badge variant="secondary" className="text-xs">
              {team.sport}
            </Badge>
          )}
          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> {memberCount}
          </span>
          {team.is_private ? (
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </div>
      </div>
      
      {isMember && (
        <Badge variant="default" size="sm" className="flex-shrink-0">
          Member
        </Badge>
      )}
    </Card>
  );
});
TeamCard.displayName = "TeamCard";
