import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { z } from "zod";

const uuidSchema = z.string().uuid({ message: "Invalid invitation link" });

const AcceptInvitation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);

  useEffect(() => {
    const handleInvitation = async () => {
      const rawId = searchParams.get("id");
      
      // Validate UUID format
      const validation = uuidSchema.safeParse(rawId);
      if (!validation.success) {
        setError("Invalid invitation link. Please check the URL and try again.");
        setLoading(false);
        return;
      }
      
      const invitationId = validation.data;

      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Store invitation ID and redirect to auth
        sessionStorage.setItem("pendingInvitationId", invitationId);
        navigate("/auth");
        return;
      }

      // User is authenticated, call backend function to accept invitation
      try {
        setLoading(true);
        
        const { data, error } = await supabase.functions.invoke('accept-team-invitation', {
          body: { invitationId }
        });

        if (error) throw error;

        if (!data?.teamId) {
          throw new Error("Invalid response from server");
        }

        setTeamId(data.teamId);
        
        if (data.alreadyAccepted) {
          toast({
            title: "Already a member",
            description: "You're already part of this team",
          });
        } else {
          toast({
            title: "Success!",
            description: "You've joined the team",
          });
        }

        // Redirect to team page
        setTimeout(() => navigate(`/teams/${data.teamId}`), 1500);
        
      } catch (err: any) {
        console.error("Error accepting invitation:", err);
        const errorMessage = err.message || "Failed to accept invitation";
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    handleInvitation();
  }, [searchParams, navigate, toast]);

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
              <p className="text-sm text-center">{error}</p>
              <Button onClick={() => navigate("/teams")} className="w-full">
                Go to Teams
              </Button>
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
