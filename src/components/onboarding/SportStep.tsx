import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { SPORTS, type Sport } from "@/lib/sports";
import { cn } from "@/lib/utils";

interface SportStepProps {
  selectedSport: string | null;
  onSelect: (sportId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const SportStep = ({ selectedSport, onSelect, onNext, onBack }: SportStepProps) => {
  const { t, i18n } = useTranslation("onboarding");
  const lang = (i18n.language?.split('-')[0] || 'fr') as 'en' | 'fr';

  // Filter out 'other' for cleaner grid, sort by priority
  const displaySports = SPORTS
    .filter(s => s.id !== 'other')
    .sort((a, b) => a.priority - b.priority);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col min-h-[70vh] px-6"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">{t("sport.title")}</h2>
        <p className="text-muted-foreground">{t("sport.subtitle")}</p>
      </div>

      {/* Sport Grid */}
      <div className="grid grid-cols-3 gap-3 mb-8 flex-1">
        {displaySports.map((sport, index) => (
          <motion.button
            key={sport.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(sport.id)}
            className={cn(
              "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200",
              selectedSport === sport.id
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            {selectedSport === sport.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2"
              >
                <Check className="w-4 h-4 text-primary" />
              </motion.div>
            )}
            <span className="text-2xl mb-1">{sport.emoji}</span>
            <span className="text-sm font-medium text-center leading-tight">
              {sport.label[lang]}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-auto pb-6">
        <Button variant="outline" onClick={onBack} className="flex-1">
          {lang === 'fr' ? 'Retour' : 'Back'}
        </Button>
        <Button onClick={onNext} disabled={!selectedSport} className="flex-1">
          {lang === 'fr' ? 'Continuer' : 'Continue'}
        </Button>
      </div>
    </motion.div>
  );
};
