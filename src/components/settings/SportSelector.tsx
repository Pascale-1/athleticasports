import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { getFeaturedSports, getRegularSports, type Sport } from "@/lib/sports";
import { Star } from "lucide-react";

interface SportSelectorProps {
  value: string;
  onChange: (sport: string) => void;
}

export const SportSelector = ({ value, onChange }: SportSelectorProps) => {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.split('-')[0] || 'fr') as 'en' | 'fr';
  
  const featuredSports = getFeaturedSports();
  const regularSports = getRegularSports();

  const renderSportButton = (sport: Sport, isFeatured: boolean) => (
    <button
      key={sport.id}
      type="button"
      onClick={() => onChange(sport.id)}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border-2 transition-all hover:scale-105 active:scale-95",
        isFeatured ? "p-5 min-h-[100px]" : "p-4 min-h-[72px]",
        value === sport.id
          ? "border-primary bg-primary/10 text-primary shadow-sm"
          : "border-border bg-background hover:border-primary/30"
      )}
      aria-pressed={value === sport.id}
      aria-label={`Select ${sport.label[lang]}`}
    >
      <span className={cn("leading-none", isFeatured ? "text-3xl" : "text-2xl")} role="img" aria-label={sport.label[lang]}>
        {sport.emoji}
      </span>
      <span className={cn("font-medium leading-tight text-center", isFeatured ? "text-sm" : "text-caption")}>
        {sport.label[lang]}
      </span>
      {isFeatured && (
        <span className="flex items-center gap-1 text-xs text-primary/70">
          <Star className="h-3 w-3 fill-current" />
          {lang === 'fr' ? 'Populaire' : 'Popular'}
        </span>
      )}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Featured Sports - Larger cards in top row */}
      <div className="grid grid-cols-2 gap-3">
        {featuredSports.map((sport) => renderSportButton(sport, true))}
      </div>
      
      {/* Separator */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {lang === 'fr' ? 'Autres sports' : 'Other sports'}
          </span>
        </div>
      </div>
      
      {/* Regular Sports - Standard 3-column grid */}
      <div className="grid grid-cols-3 gap-2">
        {regularSports.map((sport) => renderSportButton(sport, false))}
      </div>
    </div>
  );
};
