import { Check, HelpCircle, X, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

type StatusType = "going" | "maybe" | "declined" | "pending" | "full" | "available";

interface StatusPillProps {
  status: StatusType;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md";
}

const statusConfig: Record<StatusType, {
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  className: string;
}> = {
  going: {
    icon: Check,
    labelKey: "status.going",
    className: "bg-success/10 text-success border-success/20",
  },
  maybe: {
    icon: HelpCircle,
    labelKey: "status.maybe",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  declined: {
    icon: X,
    labelKey: "status.declined",
    className: "bg-muted text-muted-foreground border-muted",
  },
  pending: {
    icon: Clock,
    labelKey: "status.pending",
    className: "bg-info/10 text-info border-info/20",
  },
  full: {
    icon: Users,
    labelKey: "status.full",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  available: {
    icon: Users,
    labelKey: "status.available",
    className: "bg-primary/10 text-primary border-primary/20",
  },
};

export const StatusPill = ({
  status,
  className,
  showIcon = true,
  size = "sm",
}: StatusPillProps) => {
  const { t } = useTranslation("common");
  const config = statusConfig[status];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5 gap-0.5",
    md: "text-xs px-2 py-1 gap-1",
  };
  
  const iconSizes = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        sizeClasses[size],
        config.className,
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{t(config.labelKey)}</span>
    </span>
  );
};
