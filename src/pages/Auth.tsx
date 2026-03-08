import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
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
  const { t } = useTranslation('auth');
  const [loading, setLoading] = useState(false);
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [invitationId, setInvitationId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem("athletica_remember") === "true");
  const returnUrl = searchParams.get("returnUrl");

  const emailSchema = z.object({
    displayName: isSignUp ? z.string().min(1, t('fullNameRequired')).max(100) : z.string().optional(),
    email: z.string().email(t('invalidEmail')).max(255),
    password: z.string().min(6, t('passwordMin')).max(72),
  });

  type EmailFormData = z.infer<typeof emailSchema>;

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const onSubmit = async (data: EmailFormData) => {
    console.log("onSubmit", data);
  };

  const onError = (errors: any) => {
    console.error("onError", errors);
  };

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

    if (localStorage.getItem("athletica_remember") === "true") {
      const savedEmail = localStorage.getItem("athletica_email");
      const savedPassword = localStorage.getItem("athletica_password");
      if (savedEmail) emailForm.setValue("email", savedEmail);
      if (savedPassword) emailForm.setValue("password", savedPassword);
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
            data: {
              full_name: data.displayName,
            },
          },
        });

        if (error) throw error;

        toast(t('accountCreated'), { description: t('accountCreatedDesc') });
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

        if (rememberMe) {
          localStorage.setItem("athletica_remember", "true");
          localStorage.setItem("athletica_email", data.email);
          localStorage.setItem("athletica_password", data.password);
        } else {
          localStorage.removeItem("athletica_remember");
          localStorage.removeItem("athletica_email");
          localStorage.removeItem("athletica_password");
        }

        toast(t('welcomeBack'), { description: t('signedInSuccess') });
      }
    } catch (error: any) {
      toast.error(isSignUp ? t('signUpError') : t('signInError'), {
        description: error.message || "An error occurred during authentication.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = emailForm.getValues("email");
    if (!email) {
      toast.error(t('forgotPassword'), { description: t('forgotPasswordEnterEmail') });
      return;
    }
    try {
      const response = await supabase.functions.invoke('send-password-reset', {
        body: { email, redirectTo: `${getAppBaseUrl()}/reset-password` },
      });
      if (response.error) throw response.error;
      toast(t('forgotPasswordSuccess'), { description: t('forgotPasswordSuccessDesc') });
    } catch (error: any) {
      toast.error(t('signInError'), { description: error.message });
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

          <form
            onSubmit={emailForm.handleSubmit(handleEmailAuth)}
            className="space-y-4"
          >
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="displayName">{t('displayName', t('fullName'))}</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder={t('fullNamePlaceholder')}
                  {...emailForm.register("displayName")}
                />
                {emailForm.formState.errors.displayName && (
                  <p className="text-sm text-destructive">
                    {emailForm.formState.errors.displayName.message}
                  </p>
                )}
              </div>
            )}
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
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t('passwordPlaceholder')}
                  className="pr-10"
                  {...emailForm.register("password")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0 bg-transparent border-none cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-primary" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
              {emailForm.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {emailForm.formState.errors.password.message}
                </p>
              )}
            </div>

            {!isSignUp && (
              <label
                className="flex items-center gap-3 py-3 cursor-pointer select-none"
                htmlFor="rememberMe"
              >
                <span
                  className={`flex items-center justify-center w-[18px] h-[18px] rounded-[6px] border-[1.5px] transition-all duration-150 ease-in-out ${
                    rememberMe
                      ? "bg-primary border-primary"
                      : "bg-transparent border-muted-foreground/30"
                  }`}
                >
                  {rememberMe && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <input
                  id="rememberMe"
                  type="checkbox"
                  className="sr-only"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="text-[14px] font-normal text-foreground">
                  {t('rememberMe')}
                </span>
              </label>
            )}

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
