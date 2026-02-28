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
        "bg-gradient-to-r from-primary/20 to-primary/30",
        "border border-primary/40",
        "text-primary font-medium",
        sizeClasses[size],
        className
      )}
    >
      <Star className={cn(iconSizes[size], "fill-current")} />
      <span>{label}</span>
    </div>
  );
};
