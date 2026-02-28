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
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      {emoji && <span className="text-5xl mb-3">{emoji}</span>}
      <div className="rounded-full bg-muted p-4 mb-3">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="text-[15px] font-semibold mb-1">{title}</h3>
      <p className="text-[13px] text-muted-foreground mb-5 max-w-xs">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
