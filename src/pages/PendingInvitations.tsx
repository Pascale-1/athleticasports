import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PageContainer } from "@/components/mobile/PageContainer";
import { PageHeader } from "@/components/mobile/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check, X, Users, ArrowLeft, Mail } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";

interface PendingInvitation {
  id: string;
  team_id: string;
  role: string;
  email: string;
  created_at: string;
  expires_at: string;
  team: { name: string; avatar_url: string | null; sport: string | null } | null;
  inviter: { display_name: string | null; username: string } | null;
}

const PendingInvitations = () => {
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const { t } = useTranslation();

  const fetchInvitations = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles_public" as any)
        .select("username")
        .eq("user_id", user.id)
        .single() as { data: { username: string } | null };

      if (!profile) return;

      const userEmail = user.email;
      // Build OR filter for matching invitations
      const filters = [`invited_user_id.eq.${user.id}`];
      if (profile.username) filters.push(`email.eq.${profile.username}`);
      if (userEmail) filters.push(`email.eq.${userEmail}`);

      const { data, error } = await supabase
        .from("team_invitations")
        .select("id, team_id, role, email, created_at, expires_at, invited_by")
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString())
        .or(filters.join(","))
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch team and inviter details
      const enriched: PendingInvitation[] = await Promise.all(
        (data || []).map(async (inv) => {
          const [teamRes, inviterRes] = await Promise.all([
            supabase.from("teams").select("name, avatar_url, sport").eq("id", inv.team_id).single(),
            supabase.from("profiles_public" as any).select("display_name, username").eq("user_id", inv.invited_by).single() as unknown as Promise<{ data: { display_name: string | null; username: string } | null }>,
          ]);
          return {
            ...inv,
            team: teamRes.data,
            inviter: inviterRes.data,
          };
        })
      );

      setInvitations(enriched);
    } catch (error) {
      console.error("Error fetching pending invitations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const handleAccept = async (invitationId: string) => {
    setProcessingId(invitationId);
    try {
      const { data, error } = await supabase.functions.invoke("accept-team-invitation", {
        body: { invitationId },
      });

      const errorMessage = data?.error || error?.message;
      if (error || data?.error) {
        if (errorMessage?.toLowerCase().includes("expired")) {
          // Remove expired invitation from list
          setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
          toast.error(t("common.error", "Error"), { description: t("teams.invitationExpired", "This invitation has expired. Ask the team admin for a new one.") });
          return;
        }
        throw new Error(errorMessage || "Failed to accept invitation");
      }

      toast({ title: t("common.success", "Success"), description: t("teams.invitationAccepted", "Invitation accepted!") });

      if (data?.teamId) {
        navigate(`/teams/${data.teamId}`);
      } else {
        fetchInvitations();
      }
    } catch (err: any) {
      toast({ title: t("common.error", "Error"), description: err.message, variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (invitationId: string) => {
    setProcessingId(invitationId);
    try {
      const { error } = await supabase
        .from("team_invitations")
        .update({ status: "declined" })
        .eq("id", invitationId);

      if (error) throw error;

      toast({ title: t("common.success", "Success"), description: t("teams.invitationDeclined", "Invitation declined") });
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
    } catch (err: any) {
      toast({ title: t("common.error", "Error"), description: err.message, variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={t("teams.pendingInvitations", "Pending Invitations")}
        showBackButton
        backPath="/teams"
      />

      <div className="space-y-3 px-4 pb-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))
        ) : invitations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Mail className="h-12 w-12 mb-3 opacity-40" />
            <p className="text-sm">{t("teams.noInvitations", "No pending invitations")}</p>
          </div>
        ) : (
          invitations.map((inv) => (
            <Card key={inv.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={inv.team?.avatar_url || undefined} />
                    <AvatarFallback>
                      <Users className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{inv.team?.name || "Team"}</p>
                    {inv.team?.sport && (
                      <Badge variant="secondary" className="text-xs mt-0.5">{inv.team.sport}</Badge>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("teams.invitedBy", "Invited by")} {inv.inviter?.display_name || inv.inviter?.username || "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(inv.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={processingId === inv.id}
                    onClick={() => handleAccept(inv.id)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    {t("common.accept", "Accept")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    disabled={processingId === inv.id}
                    onClick={() => handleDecline(inv.id)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    {t("common.decline", "Decline")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </PageContainer>
  );
};

export default PendingInvitations;
