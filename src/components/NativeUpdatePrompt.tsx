import { useAppUpdate } from "@/hooks/useAppUpdate";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Browser } from "@capacitor/browser";

export const NativeUpdatePrompt = () => {
  const { t } = useTranslation("common");
  const { updateAvailable, storeUrl, dismiss } = useAppUpdate();

  const handleUpdate = async () => {
    await Browser.open({ url: storeUrl });
  };

  if (!updateAvailable) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -80, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-[60] safe-top"
      >
        <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3 min-w-0">
            <Download className="h-4 w-4 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight">{t("nativeUpdate.title")}</p>
              <p className="text-xs opacity-80 leading-tight">{t("nativeUpdate.description")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 text-xs font-semibold"
              onClick={handleUpdate}
            >
              {t("nativeUpdate.button")}
            </Button>
            <button
              onClick={dismiss}
              className="p-1 rounded-md hover:bg-primary-foreground/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
