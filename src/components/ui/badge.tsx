import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-1.5 py-0 text-[9px] font-medium transition-all gap-0.5",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-white shadow-sm",
        secondary: "border-transparent bg-muted text-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground border-border",
        success: "border-transparent bg-success text-white shadow-sm",
      },
      size: {
        xs: "px-1 py-0 text-[8px] h-3.5 min-w-[14px]",
        sm: "px-1.5 py-0 text-[9px] h-[20px] font-medium",
        md: "px-2 py-0.5 text-[10px]",
        lg: "px-3 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
