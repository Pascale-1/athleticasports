import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-3 text-center">
      <div className="rounded-full bg-muted p-4 mb-3">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold mb-1.5">{title}</h3>
      <p className="text-xs text-muted-foreground mb-4 max-w-md">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
