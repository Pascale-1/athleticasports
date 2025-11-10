import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const PageContainer = ({ 
  children, 
  className,
  noPadding = false 
}: PageContainerProps) => {
  return (
    <div 
      className={cn(
        "w-full",
        !noPadding && "px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8",
        className
      )}
    >
      {children}
    </div>
  );
};
