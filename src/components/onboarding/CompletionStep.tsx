import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle2, Star } from "lucide-react";
import { type OnboardingGoal } from "./GoalStep";

interface CompletionStepProps {
  goal: OnboardingGoal | null;
  onComplete: () => void;
}

export const CompletionStep = ({ goal, onComplete }: CompletionStepProps) => {
  const { t } = useTranslation("onboarding");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6"
    >
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="mb-6"
      >
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold mb-2"
      >
        {t("completion.title")}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground mb-8"
      >
        {t("completion.subtitle")}
      </motion.p>

      {/* Founding Member Badge Reveal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-6 mb-8 max-w-sm"
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          <span className="font-semibold text-amber-600 dark:text-amber-400">
            {t("completion.foundingMember")}
          </span>
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
        </div>
        <p className="text-sm text-muted-foreground">
          {t("completion.foundingMemberDescription")}
        </p>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-xs"
      >
        <Button onClick={onComplete} size="lg" className="w-full text-lg py-6">
          {t("completion.goToHome")}
        </Button>
      </motion.div>
    </motion.div>
  );
};
