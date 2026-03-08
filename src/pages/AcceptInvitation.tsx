import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, AlertCircle, Users, LogIn, UserPlus } from "lucide-react";
import { z } from "zod";

const uuidSchema = z.string().uuid({ message: "Invalid invitation link" });

type PageState = "loading" | "unauthenticated" | "accepting" | "success" | "error";

interface TeamInfo {
  name: string;
  sport: string | null;
  avatar_url: string | null;
}

const AcceptInvitation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const { t } = useTranslation('common');
  const { t: tTeams } = useTranslation('teams');
  const [pageState, setPageState] = useState<PageState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{
    userEmail?: string;
    invitedEmail?: string;
    errorType?: string;
  }>({});
  const [teamId, setTeamId] = useState<string | null>(null);
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [retrying, setRetrying] = useState(false);

  const invitationId = (() => {
    const raw = searchParams.get("id");
    const result = uuidSchema.safeParse(raw);
    return result.success ? result.data : null;
  })();

  // Fetch team info for unauthenticated landing page
  const fetchTeamInfo = async (invId: string) => {
    try {
      // Use a lightweight fetch — the invitation table has limited public access,
      // but the edge function can provide team info. For now, we'll just show the invite page.
      // Team info will be fetched after auth.
    } catch {
      // Silently fail — team info is optional for the landing page
    }
  };

  const handleInvitation = async () => {
    if (!invitationId) {
      setError(t("acceptInvitation.invalidLink"));
      setErrorDetails({ errorType: 'invalid_link' });
      setPageState("error");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Store for post-auth redirect
      sessionStorage.setItem("pendingInvitationId", invitationId);
      setPageState("unauthenticated");
      return;
    }

    // User is authenticated — proceed to accept
    try {
      setPageState("accepting");
      setRetrying(false);

      const { data, error: fnError } = await supabase.functions.invoke('accept-team-invitation', {
        body: { invitationId }
      });

      const errorMessage = data?.error || fnError?.message;

      if (fnError || data?.error) {
        if (errorMessage?.includes('expired')) {
          setErrorDetails({ errorType: 'expired' });
          throw new Error(tTeams('invitations.expired', 'This invitation has expired. Please ask the team admin to send a new one.'));
        }

        if (errorMessage?.includes('not authorized') || errorMessage?.includes('email')) {
          const { data: invitationData } = await supabase
            .from('team_invitations')
            .select('email')
            .eq('id', invitationId)
            .single();

          setErrorDetails({
            userEmail: user.email,
            invitedEmail: invitationData?.email,
            errorType: 'wrong_email'
          });

          throw new Error(`${t("acceptInvitation.emailMismatchDesc")}`);
        }
        throw new Error(errorMessage || t("errors.generic"));
      }

      if (!data?.teamId) {
        throw new Error(t("acceptInvitation.invalidResponse"));
      }

      setTeamId(data.teamId);
      setPageState("success");

      if (data.alreadyAccepted) {
        toast(tTeams('toast.alreadyMember'), { description: tTeams('toast.alreadyMemberDesc') });
      } else {
        toast.success(t('status.success'), { description: tTeams('toast.joinSuccess', { name: '' }) });
      }

      setTimeout(() => navigate(`/teams/${data.teamId}`), 1500);

    } catch (err: any) {
      console.error("[AcceptInvitation] Error accepting invitation:", err);
      const errorMessage = err.message || tTeams('toast.leaveError');
      setError(errorMessage);
      setPageState("error");
      toast({
        variant: "destructive",
        title: t('status.error'),
        description: errorMessage,
      });
    }
  };

  useEffect(() => {
    handleInvitation();
  }, [searchParams]);

  const handleRetry = () => {
    setError(null);
    setErrorDetails({});
    setRetrying(true);
    handleInvitation();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate(`/auth?invitationId=${invitationId}`);
  };

  // Unauthenticated landing page — show context before redirecting to auth
  if (pageState === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-xl">{t("acceptInvitation.youreInvited", "You've been invited to join a team!")}</CardTitle>
            <CardDescription>
              {t("acceptInvitation.signInToAccept", "Sign in or create an account to accept this invitation.")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button
              className="w-full gap-2"
              onClick={() => navigate(`/auth?invitationId=${invitationId}`)}
            >
              <LogIn className="h-4 w-4" />
              {t("acceptInvitation.signIn", "Sign In")}
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => navigate(`/auth?invitationId=${invitationId}&mode=signup`)}
            >
              <UserPlus className="h-4 w-4" />
              {t("acceptInvitation.createAccount", "Create Account")}
            </Button>
            <Link to="/teams/invitations/help" className="text-center mt-2">
              <Button variant="link" className="text-xs text-muted-foreground">
                {t("acceptInvitation.needHelp")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("acceptInvitation.title")}</CardTitle>
          <CardDescription>
            {(pageState === "loading" || pageState === "accepting") && t("acceptInvitation.processing")}
            {pageState === "error" && t("acceptInvitation.problem")}
            {pageState === "success" && t("acceptInvitation.success")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {(pageState === "loading" || pageState === "accepting") && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">{t("acceptInvitation.accepting")}</p>
            </>
          )}

          {pageState === "error" && (
            <>
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="text-sm text-center mb-4">{error}</p>

              {errorDetails.errorType === 'expired' && (
                <Alert className="mb-4 border-muted">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{t("acceptInvitation.invitationExpired")}</AlertTitle>
                  <AlertDescription className="text-xs mt-2 text-muted-foreground">
                    {t("acceptInvitation.invitationExpiredDesc")}
                  </AlertDescription>
                </Alert>
              )}

              {errorDetails.errorType === 'wrong_email' && (
                <Alert className="mb-4 border-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{t("acceptInvitation.emailMismatch")}</AlertTitle>
                  <AlertDescription className="text-xs">
                    <div className="space-y-2 mt-2">
                      <div>
                        <strong>{t("acceptInvitation.invitedEmail")}</strong> {errorDetails.invitedEmail}
                      </div>
                      <div>
                        <strong>{t("acceptInvitation.yourEmail")}</strong> {errorDetails.userEmail}
                      </div>
                      <div className="mt-3 text-muted-foreground">
                        {t("acceptInvitation.emailMismatchDesc")}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-2 w-full">
                {errorDetails.errorType === 'wrong_email' && (
                  <Button onClick={handleSignOut} variant="default" className="w-full">
                    {t("acceptInvitation.signInDifferent")}
                  </Button>
                )}
                <Button onClick={handleRetry} variant="outline" className="w-full" disabled={retrying}>
                  {retrying ? t("actions.retrying") : t("actions.tryAgain")}
                </Button>
                <Button onClick={() => navigate("/teams")} variant="ghost" className="w-full">
                  {t("acceptInvitation.goToTeams")}
                </Button>
                <Link to="/teams/invitations/help" className="text-center">
                  <Button variant="link" className="text-xs">
                    {t("acceptInvitation.needHelp")}
                  </Button>
                </Link>
              </div>
            </>
          )}

          {pageState === "success" && teamId && (
            <>
              <CheckCircle className="h-12 w-12 text-success" />
              <p className="text-sm text-center">{t("acceptInvitation.redirecting")}</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitation;
