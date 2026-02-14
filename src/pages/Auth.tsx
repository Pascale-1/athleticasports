import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { t } = useTranslation('auth');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
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

    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    const invitationIdParam = searchParams.get("invitationId");

    if (invitationIdParam) {
      setInvitationId(invitationIdParam);
      sessionStorage.setItem("pendingInvitationId", invitationIdParam);
    }

    if (error) {
      const friendlyMessage = errorDescription
        ? errorDescription.replace(/\+/g, " ")
        : "An error occurred during sign in";

      console.error("[Auth] OAuth error:", error, errorDescription);

      toast({
        variant: "destructive",
        title: t('googleSignInError'),
        description: friendlyMessage,
      });

      const cleanUrl = invitationIdParam
        ? `/auth?invitationId=${invitationIdParam}`
        : "/auth";
      window.history.replaceState({}, "", cleanUrl);
    }
  }, [searchParams, toast, t]);

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
            emailRedirectTo: `${window.location.origin}/`,
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

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    try {
      console.log("[OAuth] Starting Google sign-in via Lovable Cloud", {
        origin: window.location.origin,
        invitationId: invitationId || "none",
      });

      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });

      if (error) throw error;
    } catch (error: any) {
      console.error("[OAuth] Google sign in error", error);
      setGoogleLoading(false);
      toast({
        variant: "destructive",
        title: t('googleSignInError'),
        description: error.message || "Failed to sign in with Google.",
      });
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
        body: { email, redirectTo: `${window.location.origin}/reset-password` },
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

  const handleAppleAuth = async () => {
    setAppleLoading(true);
    try {
      console.log("[OAuth] Starting Apple sign-in via Lovable Cloud");

      const { error } = await lovable.auth.signInWithOAuth("apple", {
        redirect_uri: window.location.origin,
      });

      if (error) throw error;
    } catch (error: any) {
      console.error("[OAuth] Apple sign in error", error);
      setAppleLoading(false);
      toast({
        variant: "destructive",
        title: t('appleSignInError'),
        description: error.message || "Failed to sign in with Apple.",
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

          {/* Google Sign-In - Primary CTA */}
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="w-full h-12 text-body font-medium"
            onClick={handleGoogleAuth}
            disabled={loading || googleLoading}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {googleLoading ? t('signingIn') : t('continueWithGoogle')}
          </Button>

          {/* Apple Sign-In */}
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="w-full h-12 text-body font-medium"
            onClick={handleAppleAuth}
            disabled={loading || appleLoading}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            {appleLoading ? t('signingIn') : t('continueWithApple')}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-caption uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t('orContinueWith')}
              </span>
            </div>
          </div>

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
