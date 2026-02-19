import { format, isToday, isTomorrow, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import { getLocale } from "@/lib/dateUtils";

interface DateBlockProps {
  date: Date | string;
  size?: "inline" | "compact" | "sm" | "md" | "lg";
  className?: string;
  showWeekday?: boolean;
}

export const DateBlock = ({ date, size = "sm", className, showWeekday = false }: DateBlockProps) => {
  const d = typeof date === "string" ? new Date(date) : date;
  const locale = getLocale();
  
  const day = format(d, "d", { locale });
  const month = format(d, "MMM", { locale });
  const weekday = format(d, "EEE", { locale });
  
  const isEventToday = isToday(d);
  const isEventTomorrow = isTomorrow(d);
  const isEventPast = isPast(d) && !isEventToday;

  // Inline variant - horizontal "24 Jan" format
  if (size === "inline") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium shrink-0",
          isEventToday && "bg-primary text-primary-foreground",
          isEventTomorrow && "bg-warning/15 text-warning",
          isEventPast && "bg-muted/50 text-muted-foreground",
          !isEventToday && !isEventTomorrow && !isEventPast && "bg-primary/10 text-primary",
          className
        )}
      >
        <span className="font-bold">{day}</span>
        <span className="uppercase text-[10px]">{month}</span>
      </div>
    );
  }
  
  const sizeClasses = {
    compact: "w-12 text-[9px] gap-0",
    sm: "w-12 text-[9px] gap-0",
    md: "w-13 text-[10px] gap-0",
    lg: "w-14 text-xs gap-0.5",
  };
  
  const dayClasses = {
    compact: "text-lg font-bold",
    sm: "text-lg font-bold",
    md: "text-xl font-bold",
    lg: "text-2xl font-bold",
  };

  const showWd = showWeekday || size === "compact" || size === "sm";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg shrink-0 py-2 px-1",
        sizeClasses[size],
        isEventToday && "bg-primary text-primary-foreground",
        isEventTomorrow && "bg-warning/15 text-warning",
        isEventPast && "bg-muted/50 text-muted-foreground",
        !isEventToday && !isEventTomorrow && !isEventPast && "bg-primary/10 text-primary",
        className
      )}
    >
      <span className="uppercase leading-none tracking-wide font-medium">{month}</span>
      <span className={cn(dayClasses[size], "leading-tight")}>{day}</span>
      {showWd && (
        <span className="uppercase leading-none tracking-wide font-medium opacity-70">{weekday}</span>
      )}
    </div>
  );
};
