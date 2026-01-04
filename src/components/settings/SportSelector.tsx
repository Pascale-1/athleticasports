import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { getActiveSports, type Sport } from "@/lib/sports";

interface SportSelectorProps {
  value: string;
  onChange: (sport: string) => void;
}

export const SportSelector = ({ value, onChange }: SportSelectorProps) => {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.split('-')[0] || 'fr') as 'en' | 'fr';
  
  const sports = getActiveSports();

  const renderSportButton = (sport: Sport) => (
    <button
      key={sport.id}
      type="button"
      onClick={() => onChange(sport.id)}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border-2 transition-all hover:scale-105 active:scale-95 p-4 min-h-[80px]",
        value === sport.id
          ? "border-primary bg-primary/10 text-primary shadow-sm"
          : "border-border bg-background hover:border-primary/30"
      )}
      aria-pressed={value === sport.id}
      aria-label={`Select ${sport.label[lang]}`}
    >
      <span className="text-2xl leading-none" role="img" aria-label={sport.label[lang]}>
        {sport.emoji}
      </span>
      <span className="text-sm font-medium leading-tight text-center">
        {sport.label[lang]}
      </span>
    </button>
  );

  return (
    <div className="grid grid-cols-3 gap-3">
      {sports.map((sport) => renderSportButton(sport))}
    </div>
  );
};
