import { format, isToday, isTomorrow, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import { getLocale } from "@/lib/dateUtils";

interface DateBlockProps {
  date: Date | string;
  size?: "inline" | "sm" | "md" | "lg";
  className?: string;
}

export const DateBlock = ({ date, size = "sm", className }: DateBlockProps) => {
  const d = typeof date === "string" ? new Date(date) : date;
  const locale = getLocale();
  
  const day = format(d, "d", { locale });
  const month = format(d, "MMM", { locale });
  
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
    sm: "w-10 h-12 text-[9px] gap-0",
    md: "w-11 h-13 text-[10px] gap-0",
    lg: "w-13 h-16 text-xs gap-0.5",
  };
  
  const dayClasses = {
    sm: "text-base font-bold",
    md: "text-lg font-bold",
    lg: "text-xl font-bold",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg shrink-0",
        sizeClasses[size],
        isEventToday && "bg-primary text-primary-foreground",
        isEventTomorrow && "bg-warning/15 text-warning",
        isEventPast && "bg-muted/50 text-muted-foreground",
        !isEventToday && !isEventTomorrow && !isEventPast && "bg-primary/10 text-primary",
        className
      )}
    >
      <span className="uppercase leading-none tracking-wide font-medium">{month}</span>
      <span className={cn(dayClasses[size], "leading-none")}>{day}</span>
    </div>
  );
};
