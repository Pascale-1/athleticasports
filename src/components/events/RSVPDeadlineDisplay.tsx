import { useTranslation } from "react-i18next";
import { Clock, AlertCircle, Lock } from "lucide-react";
import { formatDistanceToNow, isPast, differenceInHours } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getLocale } from "@/lib/dateUtils";

interface RSVPDeadlineDisplayProps {
  deadline: string;
  className?: string;
}

export const RSVPDeadlineDisplay = ({
  deadline,
  className,
}: RSVPDeadlineDisplayProps) => {
  const { t } = useTranslation("events");
  const deadlineDate = new Date(deadline);
  const isExpired = isPast(deadlineDate);
  const hoursUntilDeadline = differenceInHours(deadlineDate, new Date());
  const isUrgent = !isExpired && hoursUntilDeadline <= 24;
  const locale = getLocale();

  if (isExpired) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 p-3 rounded-lg border",
          "bg-muted/50 border-muted-foreground/20",
          className
        )}
      >
        <Lock className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {t("rsvpDeadline.closed")}
          </p>
          <p className="text-xs text-muted-foreground/70">
            {t("rsvpDeadline.closedDesc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-3 rounded-lg border",
        isUrgent
          ? "bg-amber-500/10 border-amber-500/30"
          : "bg-muted/30 border-border",
        className
      )}
    >
      {isUrgent ? (
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
      ) : (
        <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", isUrgent && "text-amber-700")}>
          {t("rsvpDeadline.respondBy")}
        </p>
        <p className={cn("text-xs", isUrgent ? "text-amber-600/80" : "text-muted-foreground")}>
          {formatDistanceToNow(deadlineDate, { addSuffix: true, locale })}
        </p>
      </div>
      {isUrgent && (
        <Badge variant="outline" className="bg-amber-500/20 text-amber-700 border-amber-500/30 text-xs">
          {t("rsvpDeadline.urgent")}
        </Badge>
      )}
    </div>
  );
};
