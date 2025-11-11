import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Lock, Globe, Settings, LogOut, Plus, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Team } from "@/lib/teams";
import { useSwipe } from "@/hooks/useSwipe";
import { cn } from "@/lib/utils";

interface SwipeableTeamCardProps {
  team: Team;
  memberCount: number;
  isMember: boolean;
  onLeave?: () => void;
  onSettings?: () => void;
  onJoin?: () => void;
  onShare?: () => void;
}


export const SwipeableTeamCard = ({
  team,
  memberCount,
  isMember,
  onLeave,
  onSettings,
  onJoin,
  onShare,
}: SwipeableTeamCardProps) => {
  const navigate = useNavigate();
  
  const { swipeOffset, handleTouchStart, handleTouchMove, handleTouchEnd, resetSwipe, isRevealed } = useSwipe({
    onSwipeLeft: () => {},
    onSwipeRight: () => {},
    threshold: 60,
  });

  const handleCardClick = () => {
    if (isRevealed) {
      resetSwipe();
    } else {
      navigate(`/teams/${team.id}`);
    }
  };

  const handleAction = (e: React.MouseEvent, action?: () => void) => {
    e.stopPropagation();
    action?.();
    resetSwipe();
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Action buttons revealed by swipe */}
      <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-4 z-0">
        {isMember ? (
          <>
            {onSettings && (
              <Button
                size="icon"
                variant="ghost"
                className="h-12 w-12 rounded-full bg-muted"
                onClick={(e) => handleAction(e, onSettings)}
              >
                <Settings className="h-5 w-5" />
              </Button>
            )}
            {onLeave && (
              <Button
                size="icon"
                variant="ghost"
                className="h-12 w-12 rounded-full bg-destructive/10 text-destructive"
                onClick={(e) => handleAction(e, onLeave)}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            )}
          </>
        ) : (
          <>
            {onJoin && (
              <Button
                size="icon"
                variant="ghost"
                className="h-12 w-12 rounded-full bg-primary/10 text-primary"
                onClick={(e) => handleAction(e, onJoin)}
              >
                <Plus className="h-5 w-5" />
              </Button>
            )}
            {onShare && (
              <Button
                size="icon"
                variant="ghost"
                className="h-12 w-12 rounded-full bg-muted"
                onClick={(e) => handleAction(e, onShare)}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            )}
          </>
        )}
      </div>

      {/* Card with swipe functionality */}
      <Card
        className={cn(
          "cursor-pointer transition-all hover:shadow-md relative z-10 border-l-4 border-l-primary",
          "md:translate-x-0"
        )}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: swipeOffset === 0 || swipeOffset === -80 ? "transform 0.3s ease" : "none",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleCardClick}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <Avatar className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg shrink-0">
              <AvatarImage src={team.avatar_url || ""} />
              <AvatarFallback className="rounded-lg text-lg">
                {team.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="heading-4 break-words hyphens-auto max-w-full">{team.name}</h3>
                <div className="flex items-center gap-1 shrink-0">
                  {team.is_private ? (
                    <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                  ) : (
                    <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1 body-small text-subtle">
                  <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>{memberCount}</span>
                </div>
                {team.sport && (
                  <Badge variant="secondary" className="body-small">
                    {team.sport}
                  </Badge>
                )}
                {isMember && (
                  <Badge variant="default" className="body-small">
                    Member
                  </Badge>
                )}
              </div>

              {team.description && (
                <p className="body-small text-subtle break-words hyphens-auto max-w-full line-clamp-2">
                  {team.description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
