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
    sm: "w-10 h-12 text-micro",
    md: "w-12 h-14 text-caption",
    lg: "w-14 h-16 text-body-sm",
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
        isEventTomorrow && "bg-warning/10 text-warning",
        isEventPast && "bg-muted text-muted-foreground",
        !isEventToday && !isEventTomorrow && !isEventPast && "bg-primary/10 text-primary",
        className
      )}
    >
      <span className="uppercase leading-none tracking-wider">{month}</span>
      <span className={cn(dayClasses[size], "leading-none")}>{day}</span>
    </div>
  );
};
