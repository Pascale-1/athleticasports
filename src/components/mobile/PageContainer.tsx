import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PaddingVariant = "none" | "compact" | "default" | "spacious";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
  padding?: PaddingVariant;
  bottomPadding?: boolean;
}

const paddingClasses: Record<PaddingVariant, string> = {
  none: "",
  compact: "px-3.5 py-2",
  default: "px-3.5 py-2",
  spacious: "px-4 py-3",
};

export const PageContainer = ({ 
  children, 
  className,
  noPadding = false,
  padding = "default",
  bottomPadding = true,
}: PageContainerProps) => {
  const resolvedPadding = noPadding ? "none" : padding;
  
  return (
    <div 
      className={cn(
        "w-full max-w-full overflow-x-hidden",
        paddingClasses[resolvedPadding],
        bottomPadding && "pb-14",
        className
      )}
    >
      {children}
    </div>
  );
};
