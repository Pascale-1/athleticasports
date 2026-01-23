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
      <Card className="group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer active:scale-[0.99]">
        <CardContent className="p-2.5">
          <div className="flex items-center gap-2.5">
            {/* Compact avatar */}
            <Avatar className="h-10 w-10 rounded-lg shrink-0">
              <AvatarImage src={team.avatar_url || ""} />
              <AvatarFallback className="text-base font-heading font-bold bg-primary/10 text-primary rounded-lg">
                {team.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Content - always horizontal */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-heading font-bold truncate">
                  {team.name}
                </h3>
                <div className="flex items-center gap-2 shrink-0">
                  {isMember && (
                    <Badge variant="secondary" className="text-xs font-body">Member</Badge>
                  )}
                  {team.is_private ? (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Single line description */}
              {team.description && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {team.description}
                </p>
              )}

              {/* Metadata row */}
              <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                {sport && (
                  <Badge variant="outline" className="text-xs py-0 h-5">
                    {sport}
                  </Badge>
                )}
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{memberCount}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});
TeamCard.displayName = "TeamCard";
