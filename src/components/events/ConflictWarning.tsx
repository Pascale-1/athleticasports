import { useTranslation } from "react-i18next";
import { AlertTriangle, Clock } from "lucide-react";
import { format } from "date-fns";
import { Event } from "@/lib/events";
import { cn } from "@/lib/utils";

interface ConflictWarningProps {
  conflicts: Event[];
  className?: string;
}

export const ConflictWarning = ({ conflicts, className }: ConflictWarningProps) => {
  const { t } = useTranslation("events");

  if (conflicts.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "p-3 rounded-lg border border-amber-500/30 bg-amber-500/10",
        className
      )}
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-700">
            {t("conflicts.warning", { count: conflicts.length })}
          </p>
          <div className="mt-2 space-y-1.5">
            {conflicts.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-2 text-xs text-amber-600/80"
              >
                <Clock className="h-3 w-3 shrink-0" />
                <span className="truncate font-medium">{event.title}</span>
                <span className="text-amber-600/60 shrink-0">
                  {format(new Date(event.start_time), "h:mm a")} -{" "}
                  {format(new Date(event.end_time), "h:mm a")}
                </span>
              </div>
            ))}
            {conflicts.length > 3 && (
              <p className="text-xs text-amber-600/60 pl-5">
                {t("conflicts.andMore", { count: conflicts.length - 3 })}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
