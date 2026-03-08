import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X, ArrowLeft } from "lucide-react";

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

interface UsernameStepProps {
  onNext: (username: string) => void;
  onBack: () => void;
}

export const UsernameStep = ({ onNext, onBack }: UsernameStepProps) => {
  const { t } = useTranslation("onboarding");
  const [input, setInput] = useState("");
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debouncedInput = useDebounce(input, 400);

  const isValid = USERNAME_REGEX.test(input);

  // Check availability
  useEffect(() => {
    if (!debouncedInput || !USERNAME_REGEX.test(debouncedInput)) {
      setIsAvailable(null);
      setIsChecking(false);
      return;
    }

    let cancelled = false;
    setIsChecking(true);

    supabase
      .from("profiles_public")
      .select("user_id")
      .eq("username", debouncedInput)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) {
          setIsAvailable(!data);
          setIsChecking(false);
        }
      });

    return () => { cancelled = true; };
  }, [debouncedInput]);

  // Set checking state when input changes
  useEffect(() => {
    if (input && USERNAME_REGEX.test(input)) {
      setIsChecking(true);
      setIsAvailable(null);
    }
  }, [input]);

  const handleConfirm = () => {
    if (!isValid || !isAvailable || isSubmitting) return;
    setIsSubmitting(true);
    onNext(input);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col min-h-[70vh] px-6 pt-4"
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 self-start"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("username.back")}
      </button>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center max-w-sm mx-auto w-full -mt-16">
        <h1 className="text-2xl font-bold text-foreground text-center mb-2">
          {t("username.title")}
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-8">
          {t("username.subtitle")}
        </p>

        {/* Input */}
        <div className="relative w-full mb-2">
          <div
            className="flex items-center w-full rounded-full h-[52px] px-4 gap-1 bg-popover border border-border"
          >
            <span className="text-base font-medium select-none text-muted-foreground">@</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20))}
              placeholder={t("username.placeholder")}
              className="flex-1 bg-transparent border-none outline-none text-foreground text-base placeholder:text-muted-foreground"
              autoFocus
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {/* Availability indicator */}
            <div className="w-5 h-5 flex items-center justify-center">
              {isChecking && input.length >= 3 && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {!isChecking && isAvailable === true && (
                <Check className="h-4 w-4 text-green-500" />
              )}
              {!isChecking && isAvailable === false && (
                <X className="h-4 w-4 text-destructive" />
              )}
            </div>
          </div>
        </div>

        {/* Helper / status text */}
        <div className="w-full px-4 mb-6 min-h-[20px]">
          {!isChecking && isAvailable === false ? (
            <p className="text-xs text-destructive">{t("username.taken")}</p>
          ) : !isChecking && isAvailable === true ? (
            <p className="text-xs text-green-500">{t("username.available")}</p>
          ) : isChecking && input.length >= 3 ? (
            <p className="text-xs text-muted-foreground">{t("username.checking")}</p>
          ) : (
            <p className="text-xs text-muted-foreground">{t("username.helper")}</p>
          )}
        </div>

        {/* Confirm button */}
        <Button
          onClick={handleConfirm}
          disabled={!isValid || !isAvailable || isSubmitting}
          size="lg"
          className="w-full text-base py-6"
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            t("username.confirm")
          )}
        </Button>
      </div>
    </motion.div>
  );
};
