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
      <div className="rounded-full bg-primary/10 p-4 mb-3">
        <Icon className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-[17px] font-bold mb-1 text-foreground">{title}</h3>
      <p className="text-[14px] text-muted-foreground mb-5 max-w-xs">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
