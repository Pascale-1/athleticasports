import { Check, HelpCircle, X, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

type StatusType = "going" | "maybe" | "declined" | "pending" | "full" | "available";

interface StatusPillProps {
  status: StatusType;
  className?: string;
  showIcon?: boolean;
  size?: "xs" | "sm" | "md";
  variant?: "default" | "dot";
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
  size = 'sm',
  variant = 'default'
}: StatusPillProps) => {
  const { t } = useTranslation('events');
  const config = statusConfig[status];
  const Icon = config.icon;

  // Dot variant - minimal colored dot
  if (variant === 'dot') {
    const dotSizeClasses = {
      xs: "h-2 w-2",
      sm: "h-2.5 w-2.5",
      md: "h-3 w-3",
    };

    const dotColorClasses: Record<StatusType, string> = {
      going: "bg-success",
      maybe: "bg-warning",
      declined: "bg-muted-foreground",
      full: "bg-destructive",
      available: "bg-primary",
      pending: "bg-warning",
    };

    return (
      <span
        className={cn(
          "rounded-full shrink-0",
          dotSizeClasses[size],
          dotColorClasses[status],
          className
        )}
      />
    );
  }

  const sizeClasses = {
    xs: "text-[9px] px-1.5 py-0.5 gap-0.5",
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
  };

  const iconSizes = {
    xs: "h-2.5 w-2.5",
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium shrink-0",
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
