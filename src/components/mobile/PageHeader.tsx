import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  breadcrumb?: string;
}

export const PageHeader = ({
  title,
  subtitle,
  rightAction,
  showBackButton = false,
  backPath,
  className,
  breadcrumb,
}: PageHeaderProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={cn("space-y-1 border-b border-border/30 pb-3", className)}>
      {/* Breadcrumb or Back button */}
      {(showBackButton || breadcrumb) && (
        <div className="flex items-center gap-2 mb-1">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="h-8 px-2 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span className="text-xs">{t('actions.back')}</span>
            </Button>
          )}
          {breadcrumb && !showBackButton && (
            <span className="text-xs text-muted-foreground">{breadcrumb}</span>
          )}
        </div>
      )}
      
      {/* Title Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-page-title font-heading font-bold truncate">{title}</h1>
          {subtitle && (
            <p className="text-caption text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        {rightAction && (
          <div className="shrink-0">{rightAction}</div>
        )}
      </div>
    </div>
  );
};
