import { format, isToday, isTomorrow, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import { getLocale } from "@/lib/dateUtils";

interface DateBlockProps {
  date: Date | string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const DateBlock = ({ date, size = "sm", className }: DateBlockProps) => {
  const d = typeof date === "string" ? new Date(date) : date;
  const locale = getLocale();
  
  const day = format(d, "d", { locale });
  const month = format(d, "MMM", { locale }).toUpperCase();
  
  const isEventToday = isToday(d);
  const isEventTomorrow = isTomorrow(d);
  const isEventPast = isPast(d) && !isEventToday;
  
  const sizeClasses = {
    sm: "w-11 h-13 text-[9px] gap-0.5 shadow-sm",
    md: "w-13 h-15 text-[10px] gap-0.5 shadow-sm",
    lg: "w-15 h-18 text-xs gap-1 shadow-sm",
  };
  
  const dayClasses = {
    sm: "text-base font-bold",
    md: "text-lg font-bold",
    lg: "text-xl font-bold",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl shrink-0 transition-all",
        sizeClasses[size],
        isEventToday && "bg-primary text-primary-foreground shadow-md",
        isEventTomorrow && "bg-warning/15 text-warning border border-warning/20",
        isEventPast && "bg-muted/50 text-muted-foreground",
        !isEventToday && !isEventTomorrow && !isEventPast && "bg-primary/10 text-primary border border-primary/10",
        className
      )}
    >
      <span className="uppercase leading-none tracking-wider font-medium">{month}</span>
      <span className={cn(dayClasses[size], "leading-none")}>{day}</span>
    </div>
  );
};
