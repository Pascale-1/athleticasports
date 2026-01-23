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
  compact: "px-3 py-2 sm:px-4 sm:py-3",
  default: "px-4 py-3 sm:px-5 sm:py-4",
  spacious: "px-5 py-4 sm:px-6 sm:py-5",
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
        bottomPadding && "pb-16",
        className
      )}
    >
      {children}
    </div>
  );
};
