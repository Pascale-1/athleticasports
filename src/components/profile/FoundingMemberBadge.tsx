import { useTranslation } from "react-i18next";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface FoundingMemberBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FoundingMemberBadge = ({ className, size = 'md' }: FoundingMemberBadgeProps) => {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.split('-')[0] || 'fr') as 'en' | 'fr';
  
  const label = lang === 'fr' ? 'Membre Fondatrice' : 'Founding Member';

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full",
        "bg-gradient-to-r from-amber-500/20 to-orange-500/20",
        "border border-amber-500/40",
        "text-amber-600 dark:text-amber-400 font-medium",
        sizeClasses[size],
        className
      )}
    >
      <Star className={cn(iconSizes[size], "fill-current")} />
      <span>{label}</span>
    </div>
  );
};
