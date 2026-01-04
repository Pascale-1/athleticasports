import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { getActiveSports } from "@/lib/sports";

interface TeamFiltersProps {
  activeSport: string;
  onSportChange: (sport: string) => void;
}

export const TeamFilters = ({ activeSport, onSportChange }: TeamFiltersProps) => {
  const { i18n, t } = useTranslation();
  const lang = (i18n.language?.split('-')[0] || 'fr') as 'en' | 'fr';
  
  const allLabel = lang === 'fr' ? 'Tous' : 'All';
  const sports = getActiveSports();

  return (
    <div className="w-full max-w-full">
      <div className="flex flex-wrap gap-2 pb-2">
        {/* All filter */}
        <Button
          variant={activeSport === "All" || activeSport === "Tous" ? "default" : "outline"}
          onClick={() => onSportChange("All")}
          className="h-11 px-4 text-sm"
        >
          {allLabel}
        </Button>
        
        {/* Sport filters */}
        {sports.map((sport) => (
          <Button
            key={sport.id}
            variant={activeSport === sport.id || activeSport === sport.label[lang] ? "default" : "outline"}
            onClick={() => onSportChange(sport.id)}
            className="h-11 px-4 text-sm"
          >
            {sport.emoji} {sport.label[lang]}
          </Button>
        ))}
      </div>
    </div>
  );
};
