import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarStack } from "@/components/ui/avatar-stack";
import { Users, Lock, Globe, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Team } from "@/lib/teams";
import { cn } from "@/lib/utils";
import { getSportEmoji } from "@/lib/sports";

interface TeamCardProps {
  team: Team;
  memberCount?: number;
  isMember: boolean;
  onLeave?: () => void;
  onShare?: () => void;
  members?: Array<{ user_id?: string; username?: string; display_name?: string; avatar_url?: string | null }>;
}

export const TeamCard = memo(({ team, memberCount = 0, isMember, members = [] }: TeamCardProps) => {
  const { t } = useTranslation('teams');
  const sport = typeof team.sport === 'string' ? team.sport : null;
  const sportEmoji = sport ? getSportEmoji(sport) : null;

  return (
    <Link to={`/teams/${team.id}`}>
      <Card variant="interactive" className="group">
        <CardContent className="p-0">
          {/* Sport Ribbon */}
          {sport && (
            <div className="px-3 py-1.5 bg-primary/5 border-b border-border/50">
              <span className="text-caption font-medium text-primary flex items-center gap-1">
                {sportEmoji && <span>{sportEmoji}</span>}
                <span className="uppercase tracking-wider">{sport}</span>
              </span>
            </div>
          )}
          
          <div className="p-3">
            <div className="flex items-center gap-3">
              {/* Avatar - Larger */}
              <Avatar className="h-12 w-12 rounded-xl shrink-0">
                <AvatarImage src={team.avatar_url || ""} />
                <AvatarFallback className="text-lg font-heading font-bold bg-primary/10 text-primary rounded-xl">
                  {team.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-card-title font-heading font-semibold truncate">
                    {team.name}
                  </h3>
                  {isMember && (
                    <Badge variant="secondary" size="xs" className="shrink-0">
                      ✓
                    </Badge>
                  )}
                  {team.is_private ? (
                    <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                  ) : (
                    <Globe className="h-3 w-3 text-muted-foreground shrink-0" />
                  )}
                </div>

                {/* Description */}
                {team.description && (
                  <p className="text-caption text-muted-foreground line-clamp-2 mt-0.5">
                    {team.description}
                  </p>
                )}

                {/* Members row */}
                <div className="flex items-center gap-2 mt-1.5">
                  {members.length > 0 ? (
                    <AvatarStack users={members} max={4} size="xs" />
                  ) : (
                    <div className="flex items-center gap-1 text-caption text-muted-foreground">
                      <Users className="h-2.5 w-2.5" />
                      <span>{memberCount} {memberCount === 1 ? t('member') : t('memberPlural')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Chevron */}
              <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors shrink-0" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});
TeamCard.displayName = "TeamCard";
