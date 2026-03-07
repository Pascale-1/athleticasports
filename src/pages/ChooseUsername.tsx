import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";
import { getFriendlyUsername } from "@/lib/usernameUtils";
import { Loader2, Check, X } from "lucide-react";

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

const ChooseUsername = () => {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
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
      .from("profiles")
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

  const handleConfirm = async () => {
    if (!isValid || !isAvailable || isSubmitting) return;
    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({ username: input })
      .eq("user_id", user.id);

    navigate("/", { replace: true });
  };

  const handleSkip = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, full_name")
      .eq("user_id", user.id)
      .maybeSingle();

    const base = getFriendlyUsername(
      "user_placeholder",
      profile?.display_name,
      profile?.full_name
    );
    const fallback = `${base}_${user.id.substring(0, 4)}`;

    const { error } = await supabase
      .from("profiles")
      .update({ username: fallback })
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to set fallback username:", error);
    }

    sessionStorage.setItem(`username_ok_v2_${user.id}`, '1');
    navigate("/", { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 py-8">
      {/* Skip link */}
      <button
        onClick={handleSkip}
        className="self-start text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {t("usernameSelection.skip")}
      </button>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center max-w-sm mx-auto w-full -mt-16">
        <h1 className="text-2xl font-bold text-foreground text-center mb-2">
          {t("usernameSelection.title")}
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-8">
          {t("usernameSelection.subtitle")}
        </p>

        {/* Input */}
        <div className="relative w-full mb-2">
          <div
            className="flex items-center w-full rounded-full h-[52px] px-4 gap-1"
            style={{
              backgroundColor: "#111318",
              border: "1.5px solid #334155",
            }}
          >
            <span style={{ color: "#64748B" }} className="text-base font-medium select-none">@</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20))}
              placeholder={t("usernameSelection.placeholder")}
              className="flex-1 bg-transparent border-none outline-none text-foreground text-base placeholder:text-muted-foreground"
              autoFocus
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {/* Availability indicator */}
            <div className="w-5 h-5 flex items-center justify-center">
              {isChecking && input.length >= 3 && (
                <Loader2 className="h-4 w-4 animate-spin" style={{ color: "#64748B" }} />
              )}
              {!isChecking && isAvailable === true && (
                <Check className="h-4 w-4" style={{ color: "#16A34A" }} />
              )}
              {!isChecking && isAvailable === false && (
                <X className="h-4 w-4" style={{ color: "#F87171" }} />
              )}
            </div>
          </div>
        </div>

        {/* Helper / status text */}
        <div className="w-full px-4 mb-6 min-h-[20px]">
          {!isChecking && isAvailable === false ? (
            <p className="text-xs" style={{ color: "#F87171" }}>
              {t("usernameSelection.taken")}
            </p>
          ) : !isChecking && isAvailable === true ? (
            <p className="text-xs" style={{ color: "#16A34A" }}>
              {t("usernameSelection.available")}
            </p>
          ) : isChecking && input.length >= 3 ? (
            <p className="text-xs" style={{ color: "#64748B" }}>
              {t("usernameSelection.checking")}
            </p>
          ) : (
            <p className="text-xs" style={{ color: "#64748B" }}>
              {t("usernameSelection.helper")}
            </p>
          )}
        </div>

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          disabled={!isValid || !isAvailable || isSubmitting}
          className="w-full h-[52px] rounded-full font-semibold text-base transition-opacity"
          style={{
            backgroundColor: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
            opacity: !isValid || !isAvailable || isSubmitting ? 0.4 : 1,
          }}
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
          ) : (
            t("usernameSelection.confirm")
          )}
        </button>
      </div>
    </div>
  );
};

export default ChooseUsername;
