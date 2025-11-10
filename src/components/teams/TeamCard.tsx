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
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={team.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {team.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="flex items-center gap-2">
                {team.name}
                {team.is_private ? (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Globe className="h-4 w-4 text-muted-foreground" />
                )}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{memberCount} members</span>
              </div>
            </div>
          </div>
          {isMember && (
            <Badge variant="secondary">Member</Badge>
          )}
        </div>
      </CardHeader>
      {team.description && (
        <CardContent>
          <CardDescription className="line-clamp-2">{team.description}</CardDescription>
        </CardContent>
      )}
    </Card>
  );
};
