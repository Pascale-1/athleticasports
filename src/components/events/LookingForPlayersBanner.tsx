import { useTranslation } from "react-i18next";
import { Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LookingForPlayersBannerProps {
  playersNeeded: number;
  currentAttending?: number;
  maxParticipants?: number;
  allowPublicJoin?: boolean;
  isTeamMember?: boolean;
  onRequestJoin?: () => void;
  className?: string;
}

export const LookingForPlayersBanner = ({
  playersNeeded,
  currentAttending = 0,
  maxParticipants,
  allowPublicJoin = true,
  isTeamMember = false,
  onRequestJoin,
  className,
}: LookingForPlayersBannerProps) => {
  const { t } = useTranslation("events");

  // Calculate spots still needed
  const spotsRemaining = maxParticipants 
    ? Math.max(0, maxParticipants - currentAttending)
    : playersNeeded;

  if (spotsRemaining <= 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-xl border",
        "bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">
              {t("lookingForPlayers.title")}
            </span>
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
              {t("lookingForPlayers.spotsLeft", { count: spotsRemaining })}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("lookingForPlayers.description")}
          </p>
        </div>
      </div>

      {allowPublicJoin && !isTeamMember && onRequestJoin && (
        <Button size="sm" onClick={onRequestJoin} className="gap-1.5 shrink-0">
          <UserPlus className="h-4 w-4" />
          {t("lookingForPlayers.requestJoin")}
        </Button>
      )}
    </div>
  );
};
