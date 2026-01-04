import { X, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useOnboardingHint } from "@/hooks/useOnboardingHint";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingHintProps {
  id: string;
  icon: LucideIcon;
  titleKey: string;
  descriptionKey: string;
  action?: {
    labelKey: string;
    onClick: () => void;
  };
  variant?: 'info' | 'success' | 'tip';
}

const variantStyles = {
  info: 'border-primary/30 bg-primary/5',
  success: 'border-green-500/30 bg-green-500/5',
  tip: 'border-amber-500/30 bg-amber-500/5',
};

const iconVariantStyles = {
  info: 'text-primary',
  success: 'text-green-600',
  tip: 'text-amber-600',
};

export const OnboardingHint = ({
  id,
  icon: Icon,
  titleKey,
  descriptionKey,
  action,
  variant = 'info',
}: OnboardingHintProps) => {
  const { t } = useTranslation();
  const { isVisible, dismiss } = useOnboardingHint(id);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={`p-4 border-2 ${variantStyles[variant]}`}>
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <Icon className={`h-5 w-5 ${iconVariantStyles[variant]}`} />
            </div>
            
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-sm">{t(titleKey)}</h4>
                <button
                  onClick={dismiss}
                  className="flex-shrink-0 p-1 rounded-full hover:bg-muted transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center"
                  aria-label="Dismiss hint"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {t(descriptionKey)}
              </p>
              
              {action && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    action.onClick();
                    dismiss();
                  }}
                  className="mt-2 h-9"
                >
                  {t(action.labelKey)}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
