import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FABProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}

export const FAB = ({ icon, label, onClick, className }: FABProps) => {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-50",
        "bg-gradient-to-r from-primary to-primary/90",
        "hover:scale-110 transition-transform duration-200",
        "md:hidden",
        className
      )}
      size="icon"
      aria-label={label}
    >
      {icon}
    </Button>
  );
};
