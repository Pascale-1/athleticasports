import { useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";

interface TrackEventOptions {
  eventName: string;
  category?: string;
  metadata?: Record<string, unknown>;
}

export const useAnalytics = () => {
  const location = useLocation();
  const lastTrackedPath = useRef<string>("");

  const trackEvent = useCallback(async ({ eventName, category = "general", metadata = {} }: TrackEventOptions) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("analytics_events" as any).insert({
        user_id: user.id,
        event_name: eventName,
        event_category: category,
        metadata,
        page_url: window.location.pathname,
      });
    } catch (error) {
      // Silent fail - analytics should never break the app
      console.debug("Analytics tracking failed:", error);
    }
  }, []);

  // Auto-track page views
  useEffect(() => {
    if (location.pathname !== lastTrackedPath.current) {
      lastTrackedPath.current = location.pathname;
      trackEvent({
        eventName: "page_view",
        category: "navigation",
        metadata: { path: location.pathname },
      });
    }
  }, [location.pathname, trackEvent]);

  return { trackEvent };
};
