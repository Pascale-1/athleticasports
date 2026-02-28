import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { z } from "zod";

const uuidSchema = z.string().uuid({ message: "Invalid invitation link" });

const AcceptInvitation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { t } = useTranslation('common');
  const { t: tTeams } = useTranslation('teams');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{
    userEmail?: string;
    invitedEmail?: string;
    errorType?: string;
  }>({});
  const [teamId, setTeamId] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const handleInvitation = async () => {
    const rawId = searchParams.get("id");
    
    const validation = uuidSchema.safeParse(rawId);
    if (!validation.success) {
      setError(t("acceptInvitation.invalidLink"));
      setErrorDetails({ errorType: 'invalid_link' });
      setLoading(false);
      return;
    }
    
    const invitationId = validation.data;

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      sessionStorage.setItem("pendingInvitationId", invitationId);
      navigate(`/auth?invitationId=${invitationId}`);
      return;
    }

    try {
      setLoading(true);
      setRetrying(false);
      
      const { data, error } = await supabase.functions.invoke('accept-team-invitation', {
        body: { invitationId }
      });

      const errorMessage = data?.error || error?.message;

      if (error || data?.error) {
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
            userEmail: session.user.email,
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
      
      if (data.alreadyAccepted) {
        toast({
          title: tTeams('toast.alreadyMember'),
          description: tTeams('toast.alreadyMemberDesc'),
        });
      } else {
        toast({
          title: t('status.success'),
          description: tTeams('toast.joinSuccess', { name: '' }),
        });
      }

      setTimeout(() => navigate(`/teams/${data.teamId}`), 1500);
      
    } catch (err: any) {
      console.error("[AcceptInvitation] Error accepting invitation:", err);
      const errorMessage = err.message || tTeams('toast.leaveError');
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: t('status.error'),
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleInvitation();
  }, [searchParams, navigate, toast]);
  
  const handleRetry = () => {
    setError(null);
    setErrorDetails({});
    setRetrying(true);
    handleInvitation();
  };
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    const invitationId = searchParams.get("id");
    navigate(`/auth?invitationId=${invitationId}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("acceptInvitation.title")}</CardTitle>
          <CardDescription>
            {loading && t("acceptInvitation.processing")}
            {error && t("acceptInvitation.problem")}
            {!loading && !error && t("acceptInvitation.success")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {loading && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">{t("acceptInvitation.accepting")}</p>
            </>
          )}
          
          {error && (
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
          
          {!loading && !error && teamId && (
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
