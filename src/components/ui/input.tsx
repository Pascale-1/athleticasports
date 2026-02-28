import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full max-w-full rounded-lg border-0 bg-accent px-3 py-2 text-[12px] text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-[12px] file:font-medium file:text-foreground placeholder:text-[hsl(var(--text-hint))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 overflow-x-hidden transition-all",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
