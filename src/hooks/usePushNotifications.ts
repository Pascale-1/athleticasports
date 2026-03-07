import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";

export type PushPermissionState = "granted" | "denied" | "default" | "unsupported";

export function usePushNotifications() {
  const { user } = useAuth();
  const [permissionState, setPermissionState] = useState<PushPermissionState>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const isSupported = Capacitor.isNativePlatform();

  // Check current state
  useEffect(() => {
    if (!isSupported) {
      setPermissionState("unsupported");
      return;
    }

    PushNotifications.checkPermissions().then(({ receive }) => {
      if (receive === "granted") setPermissionState("granted");
      else if (receive === "denied") setPermissionState("denied");
      else setPermissionState("default");
    });
  }, [isSupported]);

  // Check if already subscribed in DB
  useEffect(() => {
    if (!user || !isSupported) return;

    (supabase as any)
      .from("push_subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .then(({ data }: any) => {
        setIsSubscribed(!!(data && data.length > 0));
      });
  }, [user, isSupported]);

  // Set up listeners
  useEffect(() => {
    if (!isSupported) return;

    const registrationListener = PushNotifications.addListener(
      "registration",
      async (token) => {
        if (!user) return;
        const platform = Capacitor.getPlatform();

        const { error } = await (supabase as any)
          .from("push_subscriptions")
          .upsert(
            {
              user_id: user.id,
              device_token: token.value,
              platform,
            },
            { onConflict: "device_token" }
          );

        if (!error) {
          setIsSubscribed(true);
          setLoading(false);
        } else {
          console.error("Failed to save push token:", error);
          setLoading(false);
        }
      }
    );

    const errorListener = PushNotifications.addListener(
      "registrationError",
      (error) => {
        console.error("Push registration error:", error);
        setLoading(false);
      }
    );

    // Handle notification tap
    const actionListener = PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (action) => {
        const data = action.notification.data;
        if (data?.url) {
          window.location.href = data.url;
        }
      }
    );

    return () => {
      registrationListener.then((l) => l.remove());
      errorListener.then((l) => l.remove());
      actionListener.then((l) => l.remove());
    };
  }, [isSupported, user]);

  const subscribe = useCallback(async () => {
    if (!isSupported || !user) return false;

    setLoading(true);
    try {
      const { receive } = await PushNotifications.requestPermissions();
      setPermissionState(receive === "granted" ? "granted" : "denied");

      if (receive !== "granted") {
        setLoading(false);
        return false;
      }

      // This triggers the 'registration' listener which saves the token
      await PushNotifications.register();
      return true;
    } catch (err) {
      console.error("Push subscription failed:", err);
      setLoading(false);
      return false;
    }
  }, [isSupported, user]);

  const unsubscribe = useCallback(async () => {
    if (!isSupported || !user) return false;

    setLoading(true);
    try {
      await (supabase as any)
        .from("push_subscriptions")
        .delete()
        .eq("user_id", user.id);

      setIsSubscribed(false);
      return true;
    } catch (err) {
      console.error("Push unsubscribe failed:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported, user]);

  return {
    isSupported,
    permissionState,
    isSubscribed,
    loading,
    subscribe,
    unsubscribe,
  };
}
