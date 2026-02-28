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
      className: "bg-amber-100 text-amber-800 border-amber-300",
    },
    2: {
      icon: Check,
      label: "Intermédiaire",
      className: "bg-green-100 text-green-800 border-green-300",
    },
    3: {
      icon: Circle,
      label: "Avancée",
      className: "bg-blue-100 text-blue-800 border-blue-300",
    },
    4: {
      icon: CircleDot,
      label: "Experte",
      className: "bg-gray-100 text-gray-800 border-gray-300",
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
