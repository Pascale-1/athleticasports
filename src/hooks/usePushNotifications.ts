import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

// This will be replaced with the actual VAPID public key after generation
const VAPID_PUBLIC_KEY = "__VAPID_PUBLIC_KEY_PLACEHOLDER__";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export type PushPermissionState = "granted" | "denied" | "default" | "unsupported";

export function usePushNotifications() {
  const { user } = useAuth();
  const [permissionState, setPermissionState] = useState<PushPermissionState>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const isSupported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  // Check current state
  useEffect(() => {
    if (!isSupported) {
      setPermissionState("unsupported");
      return;
    }
    setPermissionState(Notification.permission as PushPermissionState);

    // Check if already subscribed
    if (user && Notification.permission === "granted") {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((sub) => {
          setIsSubscribed(!!sub);
        });
      });
    }
  }, [isSupported, user]);

  const subscribe = useCallback(async () => {
    if (!isSupported || !user || VAPID_PUBLIC_KEY.startsWith("__VAPID")) {
      console.warn("Push notifications not configured yet");
      return false;
    }

    setLoading(true);
    try {
      // Request permission
      const permission = await Notification.requestPermission();
      setPermissionState(permission as PushPermissionState);

      if (permission !== "granted") {
        return false;
      }

      // Get SW registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const subJson = subscription.toJSON();

      // Save to database
      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          user_id: user.id,
          endpoint: subJson.endpoint!,
          p256dh: subJson.keys!.p256dh,
          auth: subJson.keys!.auth,
        },
        { onConflict: "endpoint" }
      );

      if (error) throw error;

      setIsSubscribed(true);
      return true;
    } catch (err) {
      console.error("Push subscription failed:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported, user]);

  const unsubscribe = useCallback(async () => {
    if (!isSupported || !user) return false;

    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Remove from database
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", subscription.endpoint);

        // Unsubscribe from push
        await subscription.unsubscribe();
      }

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
