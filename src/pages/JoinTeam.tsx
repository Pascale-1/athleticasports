import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { joinTeamByCode } from "@/lib/teams";

interface TeamInfo {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  sport: string | null;
  is_private: boolean;
  allow_link_joining: boolean;
  member_count: number;
}

export default function JoinTeam() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation('teams');
  const [team, setTeam] = useState<TeamInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthAndFetchTeam();
  }, [code]);

  const checkAuthAndFetchTeam = async () => {
    if (!code) {
      setError("Invalid invite link");
      setIsLoading(false);
      return;
    }

    try {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);

      // Fetch team info
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select(`
          id,
          name,
          description,
          avatar_url,
          sport,
          is_private,
          allow_link_joining
        `)
        .eq("invite_code", code.toUpperCase())
        .single();

      if (teamError || !teamData) {
        setError("Invalid invite code or team not found");
        setIsLoading(false);
        return;
      }

      if (!teamData.allow_link_joining) {
        setError("This team is not accepting new members via link");
        setIsLoading(false);
        return;
      }

      // Get member count
      const { count } = await supabase
        .from("team_members")
        .select("*", { count: "exact", head: true })
        .eq("team_id", teamData.id)
        .eq("status", "active");

      setTeam({
        ...teamData,
        member_count: count || 0,
      });
    } catch (err) {
      console.error("Error fetching team:", err);
      setError("Failed to load team information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!code || !isAuthenticated) {
      // Redirect to auth page, then back here
      navigate(`/auth?redirect=/teams/join/${code}`);
      return;
    }

    setIsJoining(true);
    try {
      const result = await joinTeamByCode(code);

      if (result.alreadyMember) {
        toast({
          title: t('toast.alreadyMember'),
          description: t('toast.alreadyMemberDesc'),
        });
      } else {
        toast({
          title: t('status.success', { ns: 'common' }),
          description: t('toast.joinSuccess', { name: team?.name }),
        });
      }

      navigate(`/teams/${result.teamId}`);
    } catch (err: any) {
      toast({
        title: t('status.error', { ns: 'common' }),
        description: err.message || t('toast.leaveError'),
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading team information...</p>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-16">
        <Alert variant="destructive">
          <AlertDescription className="flex flex-col items-center text-center gap-4">
            <p>{error || "Team not found"}</p>
            <Button onClick={() => navigate("/teams")} variant="outline">
              Browse Teams
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-16">
      <Card>
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={team.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">
                {team.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <CardTitle className="text-3xl mb-2">{team.name}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-2 text-base">
              {team.sport && <span>⚽ {team.sport}</span>}
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {team.member_count} member{team.member_count !== 1 ? 's' : ''}
              </span>
            </CardDescription>
          </div>
          {team.is_private && (
            <Badge variant="secondary" className="mx-auto">
              <Shield className="h-3 w-3 mr-1" />
              Private Team
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {team.description && (
            <div className="text-center text-muted-foreground">
              <p>"{team.description}"</p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleJoinTeam}
              disabled={isJoining}
              className="w-full"
              size="lg"
            >
              {isJoining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : isAuthenticated ? (
                `Join ${team.name}`
              ) : (
                `Sign in to join ${team.name}`
              )}
            </Button>

            {!isAuthenticated && (
              <p className="text-xs text-center text-muted-foreground">
                You'll be redirected to sign in or create an account
              </p>
            )}

            <p className="text-xs text-center text-muted-foreground">
              By joining, you agree to the team's rules and guidelines
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
