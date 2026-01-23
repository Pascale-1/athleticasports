import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface LookingForPlayersBannerProps {
  playersNeeded: number;
  currentAttending?: number;
  maxParticipants?: number;
  className?: string;
}

export const LookingForPlayersBanner = ({
  playersNeeded,
  currentAttending = 0,
  maxParticipants,
  className,
}: LookingForPlayersBannerProps) => {
  const { t } = useTranslation("events");

  // Dynamic spots calculation - updates as people join/leave
  const totalSpots = maxParticipants || playersNeeded;
  const spotsRemaining = Math.max(0, totalSpots - currentAttending);
  const fillPercentage = Math.min(100, Math.round((currentAttending / totalSpots) * 100));

  // Hide banner when full
  if (spotsRemaining <= 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl border",
        "bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20",
        className
      )}
    >
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Users className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">
            {t("lookingForPlayers.title")}
          </span>
          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
            {t("lookingForPlayers.spotsLeft", { count: spotsRemaining })}
          </Badge>
        </div>
        
        {/* Progress bar showing fill rate */}
        <Progress 
          value={fillPercentage} 
          className="h-1.5 mt-2 bg-muted"
        />
        
        <p className="text-xs text-muted-foreground mt-1">
          {currentAttending}/{totalSpots} {t("lookingForPlayers.joined", "players joined")}
        </p>
      </div>
    </div>
  );
};
