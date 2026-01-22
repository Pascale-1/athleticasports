import { useNavigate } from "react-router-dom";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export const useLogout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation("common");

  const logout = async () => {
    try {
      // Trigger haptic feedback on mobile
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch {
        // Haptics not available on web
      }

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
        toast({
          title: t("errors.generic"),
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Clear any app-specific local storage
      localStorage.removeItem("athletica_walkthrough_completed");
      localStorage.removeItem("athletica_onboarding_hints");

      // Redirect to auth page immediately
      navigate("/auth", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: t("errors.generic"),
        variant: "destructive",
      });
    }
  };

  return { logout };
};
