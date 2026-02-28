import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  emoji?: string;
}

export const EmptyState = ({ icon: Icon, title, description, action, emoji }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-3 text-center">
      {emoji && <span className="text-4xl mb-2">{emoji}</span>}
      <div className="rounded-full bg-accent/10 p-5 mb-3">
        <Icon className="h-7 w-7 text-accent" />
      </div>
      <h3 className="text-base font-semibold mb-1.5">{title}</h3>
      <p className="text-xs text-muted-foreground mb-4 max-w-md">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
