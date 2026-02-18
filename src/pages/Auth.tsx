import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getAppBaseUrl } from "@/lib/appUrl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { t } = useTranslation('auth');
  const [loading, setLoading] = useState(false);
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [invitationId, setInvitationId] = useState<string | null>(null);
  const returnUrl = searchParams.get("returnUrl");

  const emailSchema = z.object({
    email: z.string().email(t('invalidEmail')).max(255),
    password: z.string().min(6, t('passwordMin')).max(72),
  });

  type EmailFormData = z.infer<typeof emailSchema>;

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (!error) return;
      const msg = error.message || "";
      if (msg.includes("User from sub claim in JWT does not exist") || msg.includes("user_not_found")) {
        console.warn("[Auth] Detected invalid session, signing out.");
        supabase.auth.signOut();
      }
    });

    const invitationIdParam = searchParams.get("invitationId");

    if (invitationIdParam) {
      setInvitationId(invitationIdParam);
      sessionStorage.setItem("pendingInvitationId", invitationIdParam);
    }
  }, [searchParams]);

  useEffect(() => {
    document.title = "Sign in | Athletica Sports";
    const metaDesc = "Secure sign in and sign up for Athletica Sports.";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = metaDesc;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = window.location.href;
  }, []);

  useEffect(() => {
    let hasNavigated = false;

    const handleAuthRedirect = () => {
      if (hasNavigated) return;
      hasNavigated = true;

      const pendingInvitationId = sessionStorage.getItem("pendingInvitationId");
      if (pendingInvitationId) {
        sessionStorage.removeItem("pendingInvitationId");
        navigate(`/teams/invitations/accept?id=${pendingInvitationId}`);
      } else if (returnUrl) {
        navigate(returnUrl);
      } else {
        navigate("/");
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Don't redirect on password recovery - let ResetPassword page handle it
      if (event === 'PASSWORD_RECOVERY') return;
      if (session?.user) {
        handleAuthRedirect();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleAuthRedirect();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, returnUrl]);

  const handleEmailAuth = async (data: EmailFormData) => {
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: `${getAppBaseUrl()}/`,
          },
        });

        if (error) throw error;

        toast({
          title: t('accountCreated'),
          description: t('accountCreatedDesc'),
        });
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            throw new Error(t('invalidCredentials'));
          }
          if (error.message.includes("Email not confirmed")) {
            throw new Error(t('confirmEmail'));
          }
          throw error;
        }

        toast({
          title: t('welcomeBack'),
          description: t('signedInSuccess'),
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isSignUp ? t('signUpError') : t('signInError'),
        description:
          error.message || "An error occurred during authentication.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = emailForm.getValues("email");
    if (!email) {
      toast({
        variant: "destructive",
        title: t('forgotPassword'),
        description: t('forgotPasswordEnterEmail'),
      });
      return;
    }
    try {
      const response = await supabase.functions.invoke('send-password-reset', {
        body: { email, redirectTo: `${getAppBaseUrl()}/reset-password` },
      });
      if (response.error) throw response.error;
      toast({
        title: t('forgotPasswordSuccess'),
        description: t('forgotPasswordSuccessDesc'),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t('signInError'),
        description: error.message,
      });
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-heading-1">{t('welcome')}</CardTitle>
          <CardDescription>{t('signInOrCreate')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {invitationId && (
            <Alert className="border-primary/50 bg-primary/5">
              <AlertTitle className="text-primary">{t('teamInvitation')}</AlertTitle>
              <AlertDescription className="text-body">
                {t('teamInvitationDesc')}
              </AlertDescription>
            </Alert>
          )}

          {/* Email Form */}
          <form
            onSubmit={emailForm.handleSubmit(handleEmailAuth)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                {...emailForm.register("email")}
              />
              {emailForm.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('password')}</Label>
                {!isSignUp && (
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={handleForgotPassword}
                    disabled={loading}
                  >
                    {t('forgotPassword')}
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder={t('passwordPlaceholder')}
                {...emailForm.register("password")}
              />
              {emailForm.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {emailForm.formState.errors.password.message}
                </p>
              )}
            </div>

            {invitationId && (
              <p className="text-xs text-muted-foreground text-center">
                💡 {t('useInvitedEmail')}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : isSignUp ? t('signUp') : t('signIn')}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setIsSignUp(!isSignUp)}
              disabled={loading}
            >
              {isSignUp ? t('alreadyHaveAccount') : t('dontHaveAccount')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
