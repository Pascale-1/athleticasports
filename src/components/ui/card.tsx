import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "elevated" | "bordered" | "gradient-border" | "glass";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variantStyles = {
    default: "rounded-xl border bg-card text-card-foreground shadow-soft transition-all hover:shadow-medium",
    elevated: "rounded-xl bg-card text-card-foreground shadow-medium hover:shadow-strong transition-all",
    bordered: "rounded-xl border-2 border-border bg-card text-card-foreground shadow-soft transition-all hover:border-primary/30",
    "gradient-border": "rounded-xl bg-gradient-to-r from-primary via-primary-glow to-rose p-[2px] transition-all hover:shadow-glow",
    glass: "rounded-xl bg-background/80 backdrop-blur-md border border-border/50 text-card-foreground shadow-soft transition-all",
  };

  const content = variant === "gradient-border" ? (
    <div className="h-full w-full rounded-[14px] bg-card p-6">
      {props.children}
    </div>
  ) : null;

  return (
    <div ref={ref} className={cn(variantStyles[variant], "hover-lift", className)} {...props}>
      {content || props.children}
    </div>
  );
});
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6 md:p-8", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 md:p-8 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
