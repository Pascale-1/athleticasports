import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

type DeletionStatus = "loading" | "success" | "expired" | "invalid" | "error";

export default function ConfirmDeletion() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("common");
  const [status, setStatus] = useState<DeletionStatus>("loading");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const confirmDeletion = async () => {
      if (!token) {
        setStatus("invalid");
        return;
      }

      try {
        const response = await supabase.functions.invoke("confirm-account-deletion", {
          body: { token },
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        if (response.data?.error) {
          const errorCode = response.data.error_code;
          if (errorCode === "expired_token") {
            setStatus("expired");
          } else if (errorCode === "invalid_token" || errorCode === "missing_token") {
            setStatus("invalid");
          } else {
            setStatus("error");
          }
          
          // Set language from response if available
          if (response.data.language) {
            i18n.changeLanguage(response.data.language);
          }
          return;
        }

        // Set language from successful response
        if (response.data?.language) {
          i18n.changeLanguage(response.data.language);
        }

        setStatus("success");
      } catch (error) {
        console.error("Confirmation error:", error);
        setStatus("error");
      }
    };

    confirmDeletion();
  }, [token, i18n]);

  // Countdown and redirect for success
  useEffect(() => {
    if (status === "success") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate("/auth", { replace: true });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, navigate]);

  const handleGoToAuth = () => {
    navigate("/auth", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        {status === "loading" && (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
              <CardTitle>{t("accountDeletion.confirming")}</CardTitle>
              <CardDescription>
                {t("accountDeletion.confirmingDesc")}
              </CardDescription>
            </CardHeader>
          </>
        )}

        {status === "success" && (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-green-600 dark:text-green-400">
                {t("accountDeletion.successTitle")}
              </CardTitle>
              <CardDescription>
                {t("accountDeletion.successDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                {t("accountDeletion.redirecting", { seconds: countdown })}
              </p>
              <Button onClick={handleGoToAuth} variant="outline">
                {t("accountDeletion.goToLogin")}
              </Button>
            </CardContent>
          </>
        )}

        {status === "expired" && (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-amber-600 dark:text-amber-400">
                {t("accountDeletion.expiredTitle")}
              </CardTitle>
              <CardDescription>
                {t("accountDeletion.expiredDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={handleGoToAuth}>
                {t("accountDeletion.goToLogin")}
              </Button>
            </CardContent>
          </>
        )}

        {(status === "invalid" || status === "error") && (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-destructive">
                {t("accountDeletion.errorTitle")}
              </CardTitle>
              <CardDescription>
                {t("accountDeletion.errorDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={handleGoToAuth}>
                {t("accountDeletion.goToLogin")}
              </Button>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
