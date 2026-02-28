import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface LookingForPlayersBannerProps {
  playersNeeded: number;
  currentAttending?: number;
  maxParticipants?: number;
  isUserAttending?: boolean;
  className?: string;
}

export const LookingForPlayersBanner = ({
  playersNeeded,
  currentAttending = 0,
  maxParticipants,
  isUserAttending = false,
  className,
}: LookingForPlayersBannerProps) => {
  const { t } = useTranslation("events");

  // Calculate spots remaining based on players_needed fulfillment
  // If maxParticipants is set, also cap by remaining capacity
  const capacityRemaining = maxParticipants ? Math.max(0, maxParticipants - currentAttending) : Infinity;
  const spotsRemaining = Math.max(0, Math.min(playersNeeded, capacityRemaining));
  
  // Progress tracks how many of the needed players have joined
  const filled = Math.max(0, playersNeeded - spotsRemaining);
  const fillPercentage = playersNeeded > 0 ? Math.min(100, Math.round((filled / playersNeeded) * 100)) : 0;

  // Hide banner when all needed players have joined
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
          {filled}/{playersNeeded} {t("lookingForPlayers.joined", "players joined")}
          {isUserAttending && (
            <span className="text-primary"> {t("lookingForPlayers.includingYou", "(including you)")}</span>
          )}
        </p>
      </div>
    </div>
  );
};
