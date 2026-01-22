import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

export function AccountDangerZone() {
  const { t, i18n } = useTranslation("common");
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const language = i18n.language.startsWith("fr") ? "fr" : "en";
  const confirmWord = language === "fr" ? "SUPPRIMER" : "DELETE";
  const isConfirmValid = confirmText.toUpperCase() === confirmWord;

  const handleOpenDialog = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {
      // Haptics not available on web
    }
    setShowDeleteDialog(true);
    setConfirmText("");
    setEmailSent(false);
  };

  const handleRequestDeletion = async () => {
    if (!isConfirmValid) return;

    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch {
      // Haptics not available on web
    }

    setIsDeleting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: t("errors.unauthorized"),
          variant: "destructive",
        });
        return;
      }

      const response = await supabase.functions.invoke("request-account-deletion", {
        body: { language },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      setEmailSent(true);
      toast({
        title: t("accountDeletion.emailSent"),
        description: t("accountDeletion.emailSentDesc"),
      });
    } catch (error: any) {
      console.error("Deletion request error:", error);
      toast({
        title: t("errors.generic"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (emailSent) {
    return (
      <div className="mt-8 p-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <span className="text-lg">📧</span>
          </div>
          <div>
            <h3 className="font-semibold text-green-800 dark:text-green-200">
              {t("accountDeletion.emailSent")}
            </h3>
            <p className="text-sm text-green-600 dark:text-green-400">
              {t("accountDeletion.emailSentDesc")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-8 p-4 rounded-lg border border-destructive/30 bg-destructive/5">
        <h3 className="font-semibold text-destructive mb-2">
          {t("accountDeletion.dangerZone")}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t("accountDeletion.dangerZoneDesc")}
        </p>
        <Button
          variant="outline"
          className="border-destructive text-destructive hover:bg-destructive hover:text-white"
          onClick={handleOpenDialog}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {t("accountDeletion.button")}
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <AlertDialogTitle className="text-destructive">
                {t("accountDeletion.modalTitle")}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left space-y-4">
              <p className="font-semibold text-foreground">
                {t("accountDeletion.warning")}
              </p>
              
              <p className="text-muted-foreground">
                {t("accountDeletion.dataList.intro")}
              </p>
              
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span>•</span>
                  {t("accountDeletion.dataList.profiles")}
                </li>
                <li className="flex items-center gap-2">
                  <span>•</span>
                  {t("accountDeletion.dataList.events")}
                </li>
                <li className="flex items-center gap-2">
                  <span>•</span>
                  {t("accountDeletion.dataList.messages")}
                </li>
                <li className="flex items-center gap-2">
                  <span>•</span>
                  {t("accountDeletion.dataList.history")}
                </li>
                <li className="flex items-center gap-2">
                  <span>•</span>
                  {t("accountDeletion.dataList.subscriptions")}
                </li>
              </ul>

              <div className="pt-2">
                <p className="text-sm mb-2">
                  {t("accountDeletion.confirmPrompt", { word: confirmWord })}
                </p>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={confirmWord}
                  className="font-mono uppercase"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={isDeleting}>
              {t("actions.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRequestDeletion}
              disabled={!isConfirmValid || isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("actions.loading")}
                </>
              ) : (
                t("accountDeletion.confirmButton")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
