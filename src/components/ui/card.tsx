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
    default: "rounded-xl border bg-card text-card-foreground shadow-card transition-all",
    elevated: "rounded-xl bg-card text-card-foreground shadow-card-hover hover:shadow-strong transition-all",
    bordered: "rounded-xl border-2 border-border bg-card text-card-foreground shadow-card transition-all hover:border-primary/30",
    "gradient-border": "rounded-xl bg-primary p-[2px] transition-all hover:shadow-colored",
    glass: "rounded-xl bg-background/80 backdrop-blur-md border border-border/50 text-card-foreground shadow-card transition-all",
    highlighted: "rounded-xl border bg-primary/5 ring-2 ring-primary/20 text-card-foreground shadow-card transition-all",
    muted: "rounded-xl border border-muted bg-muted/30 text-card-foreground transition-all",
    interactive: "rounded-xl border bg-card text-card-foreground shadow-card transition-all cursor-pointer active:scale-[0.98] hover:shadow-card-hover",
  };

  const accentStyles = {
    training: "border-t-[3px] border-t-info",
    match: "border-t-[3px] border-t-warning",
    meetup: "border-t-[3px] border-t-success",
    primary: "border-t-[3px] border-t-primary",
  };

  const content = variant === "gradient-border" ? (
    <div className="h-full w-full rounded-[14px] bg-card p-6">
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
    <div ref={ref} className={cn("flex flex-col space-y-1 p-3 md:p-4", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-heading-2 font-semibold leading-none tracking-tight", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-body text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-3 md:p-4 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-3 md:p-4 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
