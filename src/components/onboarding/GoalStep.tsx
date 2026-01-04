import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, Users, Calendar, UsersRound, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

export type OnboardingGoal = 'play' | 'organize' | 'team' | 'explore';

interface GoalStepProps {
  selectedGoals: OnboardingGoal[];
  onToggle: (goal: OnboardingGoal) => void;
  onNext: () => void;
  onBack: () => void;
}

const GOALS: { id: OnboardingGoal; icon: React.ElementType }[] = [
  { id: 'play', icon: Users },
  { id: 'organize', icon: Calendar },
  { id: 'team', icon: UsersRound },
  { id: 'explore', icon: Compass },
];

export const GoalStep = ({ selectedGoals, onToggle, onNext, onBack }: GoalStepProps) => {
  const { t, i18n } = useTranslation("onboarding");
  const lang = (i18n.language?.split('-')[0] || 'fr') as 'en' | 'fr';

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col min-h-[70vh] px-6"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">{t("goal.title")}</h2>
        <p className="text-muted-foreground">{t("goal.subtitle")}</p>
      </div>

      {/* Goal Cards */}
      <div className="space-y-3 flex-1">
        {GOALS.map((goal, index) => {
          const Icon = goal.icon;
          const isSelected = selectedGoals.includes(goal.id);
          
          return (
            <motion.button
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onToggle(goal.id)}
              className={cn(
                "relative w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left",
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                <Icon className="w-6 h-6" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">{t(`goal.${goal.id}.title`)}</h3>
                <p className="text-sm text-muted-foreground">{t(`goal.${goal.id}.description`)}</p>
              </div>

              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <Check className="w-5 h-5 text-primary shrink-0" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-auto pb-6">
        <Button variant="outline" onClick={onBack} className="flex-1">
          {lang === 'fr' ? 'Retour' : 'Back'}
        </Button>
        <Button onClick={onNext} disabled={selectedGoals.length === 0} className="flex-1">
          {lang === 'fr' ? 'Continuer' : 'Continue'}
        </Button>
      </div>
    </motion.div>
  );
};
