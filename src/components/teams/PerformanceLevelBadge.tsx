import { Badge } from "@/components/ui/badge";
import { Star, Check, Circle, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

interface PerformanceLevelBadgeProps {
  level: number | null;
  size?: "sm" | "md";
}

export const PerformanceLevelBadge = ({ level, size = "md" }: PerformanceLevelBadgeProps) => {
  if (!level) {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "bg-background text-muted-foreground border-dashed",
          size === "sm" ? "text-xs px-2 py-0" : ""
        )}
      >
        Not set
      </Badge>
    );
  }

  const configs = {
    1: {
      icon: Star,
      label: "Débutante",
      className: "bg-warning/20 text-warning border-warning/30",
    },
    2: {
      icon: Check,
      label: "Intermédiaire",
      className: "bg-success/20 text-success border-success/30",
    },
    3: {
      icon: Circle,
      label: "Avancée",
      className: "bg-primary/20 text-primary border-primary/30",
    },
    4: {
      icon: CircleDot,
      label: "Experte",
      className: "bg-muted text-muted-foreground border-border",
    },
  };

  const config = configs[level as keyof typeof configs];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Badge 
      className={cn(
        config.className,
        "gap-1 font-medium",
        size === "sm" ? "text-xs px-2 py-0" : ""
      )}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {config.label}
    </Badge>
  );
};
