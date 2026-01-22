import { useTranslation } from "react-i18next";
import { Users, UserPlus, Clock, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LookingForPlayersBannerProps {
  playersNeeded: number;
  currentAttending?: number;
  maxParticipants?: number;
  allowPublicJoin?: boolean;
  isTeamMember?: boolean;
  isCreator?: boolean;
  onRequestJoin?: () => void;
  requestStatus?: "pending" | "approved" | "rejected" | null;
  isLoading?: boolean;
  className?: string;
}

export const LookingForPlayersBanner = ({
  playersNeeded,
  currentAttending = 0,
  maxParticipants,
  allowPublicJoin = true,
  isTeamMember = false,
  isCreator = false,
  onRequestJoin,
  requestStatus,
  isLoading = false,
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

  const renderActionButton = () => {
    // Hide button for creator, team members, or if public join disabled
    if (isCreator || isTeamMember || !allowPublicJoin) return null;

    // Show status badge if user already requested
    if (requestStatus === "pending") {
      return (
        <Badge variant="secondary" className="gap-1.5 shrink-0">
          <Clock className="h-3 w-3" />
          <span className="hidden sm:inline">{t("joinRequests.alreadyRequested")}</span>
          <span className="sm:hidden">{t("joinRequests.pending")}</span>
        </Badge>
      );
    }

    if (requestStatus === "approved") {
      return (
        <Badge className="gap-1.5 shrink-0 bg-success text-success-foreground">
          <Check className="h-3 w-3" />
          <span className="hidden sm:inline">{t("joinRequests.approved")}</span>
        </Badge>
      );
    }

    if (requestStatus === "rejected") {
      return (
        <Badge variant="destructive" className="gap-1.5 shrink-0">
          <X className="h-3 w-3" />
          <span className="hidden sm:inline">{t("joinRequests.rejected")}</span>
        </Badge>
      );
    }

    // Show request button
    if (onRequestJoin) {
      return (
        <Button 
          size="sm" 
          onClick={onRequestJoin} 
          className="gap-1.5 shrink-0"
          disabled={isLoading}
        >
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">{t("lookingForPlayers.requestJoin")}</span>
        </Button>
      );
    }

    return null;
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 p-4 rounded-xl border",
        "bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">
              {t("lookingForPlayers.title")}
            </span>
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
              {t("lookingForPlayers.spotsLeft", { count: spotsRemaining })}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {t("lookingForPlayers.description")}
          </p>
        </div>
      </div>

      {renderActionButton()}
    </div>
  );
};
