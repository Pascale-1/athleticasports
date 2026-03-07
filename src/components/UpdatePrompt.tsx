import { useRegisterSW } from "virtual:pwa-register/react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { RefreshCw, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const UpdatePrompt = () => {
  const { t } = useTranslation("common");

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const handleDismiss = () => {
    setNeedRefresh(false);
  };

  if (!needRefresh) return null;

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
            <RefreshCw className="h-4 w-4 shrink-0 animate-spin" />
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight">{t("update.title")}</p>
              <p className="text-xs opacity-80 leading-tight">{t("update.description")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 text-xs font-semibold"
              onClick={handleUpdate}
            >
              {t("update.button")}
            </Button>
            <button
              onClick={handleDismiss}
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
