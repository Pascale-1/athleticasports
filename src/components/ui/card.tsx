import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "elevated" | "bordered" | "gradient-border" | "glass" | "highlighted" | "muted" | "interactive";
    accent?: "training" | "match" | "meetup" | "primary";
  }
>(({ className, variant = "default", accent, ...props }, ref) => {
  const variantStyles = {
    default: "rounded-[14px] shadow-[0_2px_20px_rgba(56,189,248,0.06)] bg-card text-card-foreground transition-all duration-200 active:scale-[0.99] hover:bg-popover",
    elevated: "rounded-[14px] shadow-[0_2px_20px_rgba(56,189,248,0.06)] bg-card text-card-foreground transition-all duration-200 active:scale-[0.99] hover:bg-popover",
    bordered: "rounded-[14px] border-2 border-border bg-card text-card-foreground transition-all duration-200 hover:border-primary/30 hover:bg-popover",
    "gradient-border": "rounded-[14px] bg-primary p-[2px] transition-all duration-200",
    glass: "rounded-[14px] bg-background/80 backdrop-blur-md border border-border/50 text-card-foreground transition-all duration-200",
    highlighted: "rounded-[14px] shadow-[0_2px_20px_rgba(56,189,248,0.06)] bg-primary/5 ring-2 ring-primary/20 text-card-foreground transition-all duration-200",
    muted: "rounded-[14px] border border-muted bg-muted/30 text-card-foreground transition-all duration-200",
    interactive: "rounded-[14px] shadow-[0_2px_20px_rgba(56,189,248,0.06)] bg-card text-card-foreground transition-all duration-150 cursor-pointer active:scale-[0.98] hover:bg-popover hover:shadow-md",
  };

  const accentStyles = {
    training: "border-t-2 border-t-info",
    match: "border-t-2 border-t-warning",
    meetup: "border-t-2 border-t-success",
    primary: "border-t-2 border-t-primary",
  };

  const content = variant === "gradient-border" ? (
    <div className="h-full w-full rounded-[10px] bg-card p-3.5">
      {props.children}
    </div>
  ) : null;

  return (
    <div 
      ref={ref} 
      className={cn(
        variantStyles[variant], 
        accent && accentStyles[accent],
        "w-full max-w-full min-w-0", 
        className
      )} 
      {...props}
    >
      {content || props.children}
    </div>
  );
});
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-0.5 p-2.5 px-3.5", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-[13px] font-semibold leading-none tracking-tight", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-[12px] text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-2.5 px-3.5 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-2.5 px-3.5 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
