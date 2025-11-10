import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
    size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
    ring?: "none" | "coral" | "gold" | "teal";
    status?: "none" | "online" | "offline" | "busy";
  }
>(({ className, size = "md", ring = "none", status = "none", ...props }, ref) => {
  const sizeStyles = {
    xs: "h-6 w-6",
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
    "2xl": "h-24 w-24",
  };

  const ringStyles = {
    none: "",
    coral: "ring-2 ring-primary ring-offset-2 ring-offset-background",
    gold: "ring-2 ring-gold ring-offset-2 ring-offset-background",
    teal: "ring-2 ring-teal ring-offset-2 ring-offset-background",
  };

  const statusDotSize = {
    xs: "h-1.5 w-1.5",
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
    lg: "h-3 w-3",
    xl: "h-4 w-4",
    "2xl": "h-5 w-5",
  };

  const statusColors = {
    none: "",
    online: "bg-green-500",
    offline: "bg-neutral-400",
    busy: "bg-destructive",
  };

  return (
    <div className="relative inline-block">
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full transition-all",
          sizeStyles[size],
          ringStyles[ring],
          className
        )}
        {...props}
      />
      {status !== "none" && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full ring-2 ring-background",
            statusDotSize[size],
            statusColors[status]
          )}
        />
      )}
    </div>
  );
});
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image ref={ref} className={cn("aspect-square h-full w-full", className)} {...props} />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary-dark/20 text-primary font-semibold",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
