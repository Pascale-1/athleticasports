import { useTranslation } from "react-i18next";
import { Bell, BellOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { toast } from "sonner";

export const PushNotificationToggle = () => {
  const { t } = useTranslation("common");
  const {
    isSupported,
    permissionState,
    isSubscribed,
    loading,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <BellOff className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {t("pushNotifications.unsupported")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      const success = await subscribe();
      if (success) {
        toast.success(t("pushNotifications.enabled"));
      }
    } else {
      const success = await unsubscribe();
      if (success) {
        toast.success(t("pushNotifications.disabled"));
      }
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 cursor-pointer" htmlFor="push-toggle">
            <Bell className="h-4 w-4" />
            {t("pushNotifications.toggle")}
          </Label>
          <Switch
            id="push-toggle"
            checked={isSubscribed}
            onCheckedChange={handleToggle}
            disabled={loading || permissionState === "denied"}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {permissionState === "denied"
            ? t("pushNotifications.denied")
            : t("pushNotifications.description")}
        </p>
      </CardContent>
    </Card>
  );
};
