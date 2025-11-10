import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const emailSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

const phoneSchema = z.object({
  countryCode: z.string().min(1, "Please select a country code"),
  phone: z.string().regex(/^[0-9]{6,14}$/, "Please enter a valid phone number (6-14 digits)"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type EmailFormData = z.infer<typeof emailSchema>;
type PhoneFormData = z.infer<typeof phoneSchema>;

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [oauthUrl, setOauthUrl] = useState<string | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [invitationId, setInvitationId] = useState<string | null>(null);
  const redirectUrl = `${window.location.origin}/auth`;
  const inIframe = (() => { try { return window.top !== window.self; } catch { return true; } })();

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
  });

  useEffect(() => {
    // Check for OAuth errors in URL params
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const invitationIdParam = searchParams.get('invitationId');
    
    // Store invitation ID if present (for users who need to login first)
    if (invitationIdParam) {
      setInvitationId(invitationIdParam);
      sessionStorage.setItem("pendingInvitationId", invitationIdParam);
      console.log('[Auth] Stored pending invitation ID:', invitationIdParam);
    }
    
    if (error) {
      const friendlyMessage = errorDescription 
        ? errorDescription.replace(/\+/g, ' ')
        : 'An error occurred during sign in';
      
      console.error('[Auth] OAuth error:', error, errorDescription);
      
      toast({
        variant: "destructive",
        title: "Google Sign In Error",
        description: friendlyMessage,
      });
      
      // Clean up URL but preserve invitation ID
      const cleanUrl = invitationIdParam ? `/auth?invitationId=${invitationIdParam}` : '/auth';
      window.history.replaceState({}, '', cleanUrl);
    }
  }, [searchParams, toast]);

  useEffect(() => {
    document.title = "Sign in | Athletica Sports";
    const metaDesc = "Secure sign in and sign up for Athletica Sports.";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = metaDesc;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = window.location.href;
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        // Check for pending invitation
        const pendingInvitationId = sessionStorage.getItem("pendingInvitationId");
        if (pendingInvitationId) {
          sessionStorage.removeItem("pendingInvitationId");
          navigate(`/teams/invitations/accept?id=${pendingInvitationId}`);
        } else {
          navigate("/");
        }
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Check for pending invitation
        const pendingInvitationId = sessionStorage.getItem("pendingInvitationId");
        if (pendingInvitationId) {
          sessionStorage.removeItem("pendingInvitationId");
          navigate(`/teams/invitations/accept?id=${pendingInvitationId}`);
        } else {
          navigate("/");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
          title: "Account created!",
          description: "You can now sign in with your credentials.",
        });
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        
        if (error) {
          // Provide clearer error messages
          if (error.message.includes("Invalid login credentials")) {
            throw new Error("Invalid email or password. Don't have an account? Sign up below.");
          }
          if (error.message.includes("Email not confirmed")) {
            throw new Error("Please check your email and confirm your account before signing in.");
          }
          throw error;
        }
        
        toast({
          title: "Welcome back!",
          description: "Successfully signed in.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isSignUp ? "Sign Up Error" : "Sign In Error",
        description: error.message || "An error occurred during authentication.",
      });
    } finally {
      setLoading(false);
    }
  };

const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    setOauthUrl(null);
    try {
      console.log('[OAuth] Starting Google sign-in', { 
        origin: window.location.origin,
        invitationId: invitationId || 'none'
      });
      
      // Preserve invitation ID through OAuth redirect
      const finalRedirectUrl = invitationId 
        ? `${redirectUrl}?invitationId=${invitationId}`
        : redirectUrl;
      
      console.log('[OAuth] Redirect URL:', finalRedirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: finalRedirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      console.log('[OAuth] signInWithOAuth returned', data);
      if (data?.url) {
        setOauthUrl(data.url);
        const url = data.url;
        console.log('[OAuth] Navigating to Google OAuth URL');
        try {
          if (window.top && window.top !== window.self) {
            (window.top as Window).location.href = url;
          } else {
            window.location.assign(url);
          }
        } catch (navErr) {
          console.warn('[OAuth] Top navigation blocked, opening new tab', navErr);
          window.open(url, "_blank", "noopener,noreferrer");
        }
      } else {
        throw new Error("No OAuth redirect URL was returned.");
      }
    } catch (error: any) {
      console.error('[OAuth] Google sign in error', error);
      toast({
        variant: "destructive",
        title: "Google Sign In Error",
        description: error.message || "Failed to sign in with Google.",
      });
    } finally {
      setTimeout(() => setGoogleLoading(false), 1000);
    }
  };

  const handlePhoneAuth = async (data: PhoneFormData) => {
    setLoading(true);
    try {
      const fullPhone = `${data.countryCode}${data.phone}`;
      
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          phone: fullPhone,
          password: data.password,
          options: {
            data: {
              phone: fullPhone,
            },
          },
        });
        
        if (error) throw error;
        
        toast({
          title: "Account created!",
          description: "You're now signed in with your phone number.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          phone: fullPhone,
          password: data.password,
        });
        
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            throw new Error("Invalid phone or password. Don't have an account? Sign up below.");
          }
          throw error;
        }
        
        toast({
          title: "Welcome back!",
          description: "Successfully signed in.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isSignUp ? "Sign Up Error" : "Sign In Error",
        description: error.message || "Failed to authenticate with phone.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-3 sm:p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl">Welcome</CardTitle>
          <CardDescription className="text-sm">Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {invitationId && (
            <Alert className="mb-4 border-primary/50 bg-primary/5">
              <AlertTitle className="text-primary">Team Invitation</AlertTitle>
              <AlertDescription className="text-sm">
                You've been invited to join a team! Please sign in or create an account to accept the invitation.
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" className="text-xs sm:text-sm">Email</TabsTrigger>
              <TabsTrigger value="phone" className="text-xs sm:text-sm">Phone</TabsTrigger>
            </TabsList>
            
            <TabsContent value="email" className="space-y-4">
              <form onSubmit={emailForm.handleSubmit(handleEmailAuth)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...emailForm.register("email")}
                  />
                  {emailForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {emailForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
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
                    💡 Tip: Use the same email address where you received the invitation
                  </p>
                )}
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setIsSignUp(!isSignUp)}
                  disabled={loading}
                >
                  {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                </Button>
              </form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              
              {invitationId && (
                <p className="text-xs text-muted-foreground text-center">
                  💡 You can also sign up with Google using your invited email address
                </p>
              )}
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleAuth}
                disabled={loading || googleLoading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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
                {googleLoading ? "Signing in with Google..." : "Continue with Google"}
              </Button>

              {oauthUrl && (
                <Alert className="mt-3">
                  <AlertTitle>Having trouble redirecting?</AlertTitle>
                  <AlertDescription>
                    We generated your Google sign-in link but your browser blocked automatic navigation{inIframe ? " (possibly due to iframe)." : "."}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => window.open(oauthUrl, "_blank", "noopener,noreferrer")}>Open Google Sign-in</Button>
                      <Button size="sm" variant="secondary" onClick={() => navigator.clipboard.writeText(oauthUrl)}>Copy Link</Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowDiagnostics((s) => !s)}>
                        {showDiagnostics ? "Hide details" : "Show details"}
                      </Button>
                    </div>
                    {showDiagnostics && (
                      <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
                        <div>Origin: {window.location.origin}</div>
                        <div>In iframe: {inIframe ? "yes" : "no"}</div>
                        <div>Redirect URL: {redirectUrl}</div>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="phone" className="space-y-4">
              <form onSubmit={phoneForm.handleSubmit(handlePhoneAuth)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="countryCode">Country Code</Label>
                  <select
                    id="countryCode"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...phoneForm.register("countryCode")}
                  >
                    <option value="">Select country code</option>
                    <option value="+1">🇺🇸 United States (+1)</option>
                    <option value="+1">🇨🇦 Canada (+1)</option>
                    <option value="+44">🇬🇧 United Kingdom (+44)</option>
                    <option value="+33">🇫🇷 France (+33)</option>
                    <option value="+49">🇩🇪 Germany (+49)</option>
                    <option value="+39">🇮🇹 Italy (+39)</option>
                    <option value="+34">🇪🇸 Spain (+34)</option>
                    <option value="+61">🇦🇺 Australia (+61)</option>
                    <option value="+86">🇨🇳 China (+86)</option>
                    <option value="+81">🇯🇵 Japan (+81)</option>
                    <option value="+82">🇰🇷 South Korea (+82)</option>
                    <option value="+91">🇮🇳 India (+91)</option>
                    <option value="+55">🇧🇷 Brazil (+55)</option>
                    <option value="+52">🇲🇽 Mexico (+52)</option>
                  </select>
                  {phoneForm.formState.errors.countryCode && (
                    <p className="text-sm text-destructive">
                      {phoneForm.formState.errors.countryCode.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="123456789"
                    {...phoneForm.register("phone")}
                  />
                  {phoneForm.formState.errors.phone && (
                    <p className="text-sm text-destructive">
                      {phoneForm.formState.errors.phone.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Enter your phone number without country code
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone-password">Password</Label>
                  <Input
                    id="phone-password"
                    type="password"
                    placeholder="••••••••"
                    {...phoneForm.register("password")}
                  />
                  {phoneForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {phoneForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Loading..." : isSignUp ? "Sign Up with Phone" : "Sign In with Phone"}
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setIsSignUp(!isSignUp)}
                  disabled={loading}
                >
                  {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
