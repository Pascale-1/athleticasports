import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Team } from "@/lib/teams";

interface FeaturedTeamCardProps {
  team: Team;
  memberCount: number;
  isMember: boolean;
}

export const FeaturedTeamCard = ({ team, memberCount, isMember }: FeaturedTeamCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="h-[200px] relative overflow-hidden cursor-pointer group transition-transform hover:-translate-y-1"
      onClick={() => navigate(`/teams/${team.id}`)}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
      <div className="relative z-20 p-6 h-full flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <Avatar className="h-20 w-20 border-2 border-background">
            <AvatarImage src={team.avatar_url || ""} />
            <AvatarFallback className="text-2xl">
              {team.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {team.sport && (
            <Badge variant="secondary" className="text-xs">
              {team.sport}
            </Badge>
          )}
        </div>
        
        <div>
          <h3 className="font-bold text-xl mb-1 line-clamp-1">{team.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Users className="h-4 w-4" />
            <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
          </div>
          
          {!isMember && (
            <Button 
              size="sm" 
              className="w-full bg-gradient-to-r from-primary to-primary/90"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/teams/${team.id}`);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Join Team
            </Button>
          )}
          {isMember && (
            <Badge variant="default" className="w-full justify-center py-2">
              Member
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
};
