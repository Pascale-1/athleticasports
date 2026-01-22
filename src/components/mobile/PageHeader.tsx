import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: ReactNode;
  showBackButton?: boolean;
  backPath?: string;
  className?: string;
}

export const PageHeader = ({
  title,
  subtitle,
  rightAction,
  showBackButton = false,
  backPath,
  className,
}: PageHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={cn("space-y-1", className)}>
      {showBackButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="mb-2 -ml-2 h-10 px-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      )}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-h1 font-heading font-bold truncate">{title}</h1>
          {subtitle && (
            <p className="text-body text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        {rightAction && (
          <div className="shrink-0">{rightAction}</div>
        )}
      </div>
    </div>
  );
};
