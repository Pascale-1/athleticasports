import { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { supabase } from "@/integrations/supabase/client";

const DISMISS_KEY = "native_update_dismissed_until";
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

const IOS_STORE_URL = "https://apps.apple.com/app/athletica/id6744257498";
const ANDROID_STORE_URL = "https://play.google.com/store/apps/details?id=com.athletica.sports";

function semverCompare(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

export function useAppUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [storeUrl, setStoreUrl] = useState("");

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed && Date.now() < Number(dismissed)) return;

    const check = async () => {
      try {
        const info = await App.getInfo();
        const platform = Capacitor.getPlatform(); // 'ios' | 'android'

        const { data, error } = await supabase.functions.invoke("check-app-version");
        if (error || !data) return;

        const latestVersion = platform === "ios" ? data.ios : data.android;
        if (!latestVersion) return;

        if (semverCompare(latestVersion, info.version) > 0) {
          setUpdateAvailable(true);
          setStoreUrl(platform === "ios" ? IOS_STORE_URL : ANDROID_STORE_URL);
        }
      } catch (e) {
        console.warn("App update check failed:", e);
      }
    };

    check();
  }, []);

  const dismiss = () => {
    setUpdateAvailable(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DURATION_MS));
  };

  return { updateAvailable, storeUrl, dismiss };
}
