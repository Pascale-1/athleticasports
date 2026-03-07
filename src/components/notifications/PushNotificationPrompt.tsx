import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useAuth } from "@/hooks/useAuth";

const PROMPT_DISMISSED_KEY = "athletica_push_prompt_dismissed";

export const PushNotificationPrompt = () => {
  const { t } = useTranslation("common");
  const { user } = useAuth();
  const { isSupported, permissionState, isSubscribed, subscribe, loading } =
    usePushNotifications();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (!user || !isSupported) return;
    if (permissionState === "granted" || permissionState === "denied") return;
    if (isSubscribed) return;

    const wasDismissed = localStorage.getItem(PROMPT_DISMISSED_KEY);
    if (!wasDismissed) {
      // Show prompt after a short delay
      const timer = setTimeout(() => setDismissed(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [user, isSupported, permissionState, isSubscribed]);

  const handleEnable = async () => {
    await subscribe();
    setDismissed(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(PROMPT_DISMISSED_KEY, "true");
  };

  if (dismissed || !isSupported || isSubscribed || permissionState === "granted" || permissionState === "denied") {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5 mx-4 mt-2 animate-in slide-in-from-top-2">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm">{t("pushNotifications.promptTitle")}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("pushNotifications.promptDescription")}
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleEnable} disabled={loading} className="h-8 text-xs">
                {loading ? t("actions.loading") : t("pushNotifications.enable")}
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss} className="h-8 text-xs">
                {t("pushNotifications.later")}
              </Button>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
