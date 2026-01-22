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
  const { t } = useTranslation('teams');
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
    
    // Validate UUID format
    const validation = uuidSchema.safeParse(rawId);
    if (!validation.success) {
      setError("Invalid invitation link. Please check the URL and try again.");
      setErrorDetails({ errorType: 'invalid_link' });
      setLoading(false);
      return;
    }
    
    const invitationId = validation.data;

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    console.log('[AcceptInvitation] Session check', { 
      hasSession: !!session, 
      userEmail: session?.user?.email 
    });
    
    if (!session) {
      // Store invitation ID and redirect to auth
      sessionStorage.setItem("pendingInvitationId", invitationId);
      navigate(`/auth?invitationId=${invitationId}`);
      return;
    }

    // User is authenticated, call backend function to accept invitation
    try {
      setLoading(true);
      setRetrying(false);
      
      const { data, error } = await supabase.functions.invoke('accept-team-invitation', {
        body: { invitationId }
      });

      if (error) {
        // Enhanced error handling with specific error types
        if (error.message?.includes('not authorized') || error.message?.includes('email')) {
          // Try to fetch invitation details to show which email was invited
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
          
          throw new Error(`This invitation was sent to ${invitationData?.email}, but you're signed in as ${session.user.email}`);
        }
        throw error;
      }

      if (!data?.teamId) {
        throw new Error("Invalid response from server");
      }

      setTeamId(data.teamId);
      
      console.log('[AcceptInvitation] Success!', { teamId: data.teamId, alreadyAccepted: data.alreadyAccepted });
      
      if (data.alreadyAccepted) {
        toast({
          title: t('toast.alreadyMember'),
          description: t('toast.alreadyMemberDesc'),
        });
      } else {
        toast({
          title: t('status.success', { ns: 'common' }),
          description: t('toast.joinSuccess', { name: '' }),
        });
      }

      // Redirect to team page
      setTimeout(() => navigate(`/teams/${data.teamId}`), 1500);
      
    } catch (err: any) {
      console.error("[AcceptInvitation] Error accepting invitation:", err);
      const errorMessage = err.message || t('toast.leaveError');
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: t('status.error', { ns: 'common' }),
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
          <CardTitle>Team Invitation</CardTitle>
          <CardDescription>
            {loading && "Processing your invitation..."}
            {error && "There was a problem with your invitation"}
            {!loading && !error && "Success!"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {loading && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Accepting invitation...</p>
            </>
          )}
          
          {error && (
            <>
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="text-sm text-center mb-4">{error}</p>
              
              {errorDetails.errorType === 'wrong_email' && (
                <Alert className="mb-4 border-warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Email Mismatch</AlertTitle>
                  <AlertDescription className="text-xs">
                    <div className="space-y-2 mt-2">
                      <div>
                        <strong>Invited email:</strong> {errorDetails.invitedEmail}
                      </div>
                      <div>
                        <strong>Your current email:</strong> {errorDetails.userEmail}
                      </div>
                      <div className="mt-3 text-muted-foreground">
                        To accept this invitation, you need to sign in with the email address that received it.
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex flex-col gap-2 w-full">
                {errorDetails.errorType === 'wrong_email' && (
                  <Button onClick={handleSignOut} variant="default" className="w-full">
                    Sign in with Different Email
                  </Button>
                )}
                <Button onClick={handleRetry} variant="outline" className="w-full" disabled={retrying}>
                  {retrying ? "Retrying..." : "Try Again"}
                </Button>
                <Button onClick={() => navigate("/teams")} variant="ghost" className="w-full">
                  Go to Teams
                </Button>
                <Link to="/teams/invitations/help" className="text-center">
                  <Button variant="link" className="text-xs">
                    Need help with invitations?
                  </Button>
                </Link>
              </div>
            </>
          )}
          
          {!loading && !error && teamId && (
            <>
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-sm text-center">Redirecting to your team...</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitation;
