import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Lock, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { Team } from "@/lib/teams";

interface TeamCardProps {
  team: Team;
  memberCount?: number;
  isMember: boolean;
  onLeave?: () => void;
  onShare?: () => void;
}

export const TeamCard = memo(({ team, memberCount = 0, isMember }: TeamCardProps) => {
  const sport = typeof team.sport === 'string' ? team.sport : null;

  return (
    <Link to={`/teams/${team.id}`}>
      <Card className="group h-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border-l-4 border-l-primary active:scale-[0.99]">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-16 w-16 rounded-lg shrink-0">
              <AvatarImage src={team.avatar_url || ""} />
              <AvatarFallback className="text-xl font-heading font-bold bg-primary/10 text-primary rounded-lg">
                {team.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 w-full space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base sm:text-lg font-heading font-bold truncate">
                  {team.name}
                </h3>
                {isMember && (
                  <Badge className="shrink-0 text-xs font-body">Member</Badge>
                )}
              </div>

              {team.description && (
                <p className="text-xs sm:text-sm font-body text-muted-foreground line-clamp-2">
                  {team.description}
                </p>
              )}

              <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                {sport && (
                  <Badge variant="secondary" className="text-xs font-body">
                    {sport}
                  </Badge>
                )}
                <div className="flex items-center gap-1.5 font-body">
                  <Users className="h-3.5 w-3.5" />
                  <span>{memberCount}</span>
                </div>
                {team.is_private ? (
                  <Lock className="h-3.5 w-3.5" />
                ) : (
                  <Globe className="h-3.5 w-3.5" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});
TeamCard.displayName = "TeamCard";
