import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation('auth');
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    // Mark recovery in sessionStorage so ProtectedRoute doesn't redirect
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      sessionStorage.setItem('password_recovery_active', 'true');
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsReady(true);
      }
    });

    // Check if we already have a session (user clicked the link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Also check if hash contains recovery token as extra signal
        if (hash.includes('type=recovery') || sessionStorage.getItem('password_recovery_active')) {
          setIsReady(true);
        } else {
          setIsReady(true);
        }
      }
    });

    // Timeout after 10 seconds to prevent infinite spinner
    const timeout = setTimeout(() => {
      setTimedOut(true);
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleReset = async () => {
    if (newPassword.length < 6) {
      toast({ variant: "destructive", title: t('resetPassword'), description: t('passwordMin') });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: t('resetPassword'), description: t('passwordMismatch') });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      sessionStorage.removeItem('password_recovery_active');
      toast({ title: t('passwordResetSuccess'), description: t('passwordResetSuccessDesc') });
      navigate("/");
    } catch (error: any) {
      toast({ variant: "destructive", title: t('resetPassword'), description: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!isReady) {
    if (timedOut) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-heading-1">{t('resetPassword')}</CardTitle>
              <CardDescription>{t('resetLinkExpired', 'This reset link is invalid or has expired. Please request a new one.')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/auth")} className="w-full">
                {t('backToSignIn', 'Back to Sign In')}
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-heading-1">{t('resetPassword')}</CardTitle>
          <CardDescription>{t('resetPasswordDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">{t('newPassword')}</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">{t('confirmPassword')}</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button onClick={handleReset} className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {t('resetPassword')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
