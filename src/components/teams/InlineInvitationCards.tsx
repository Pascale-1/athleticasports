import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { PendingInvitation } from "@/hooks/usePendingInvitations";
import { getActiveSports } from "@/lib/sports";

interface InlineInvitationCardsProps {
  invitations: PendingInvitation[];
  onRemove: (id: string) => void;
  onRefresh: () => void;
}

export const InlineInvitationCards = ({ invitations, onRemove, onRefresh }: InlineInvitationCardsProps) => {
  const { t, i18n } = useTranslation("teams");
  const lang = (i18n.language?.split("-")[0] || "fr") as "en" | "fr";
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const sports = getActiveSports();

  const handleAccept = async (invitation: PendingInvitation) => {
    setLoadingId(invitation.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await supabase.functions.invoke("accept-team-invitation", {
        body: { invitation_id: invitation.id },
      });

      const errorMessage = res.data?.error || res.error?.message;
      if (res.error || res.data?.error) {
        if (errorMessage?.toLowerCase().includes("expired")) {
          onRemove(invitation.id);
          toast.error(t("invitationExpired", "This invitation has expired"));
          return;
        }
        throw new Error(errorMessage || "Failed to accept");
      }

      onRemove(invitation.id);
      toast.success(t("invitationAccepted", "You joined {{team}}!", { team: invitation.team_name }));
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Error");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDecline = async (invitation: PendingInvitation) => {
    setLoadingId(invitation.id);
    try {
      const { error } = await supabase
        .from("team_invitations")
        .update({ status: "rejected" })
        .eq("id", invitation.id);

      if (error) throw error;
      onRemove(invitation.id);
      toast.info(t("invitationDeclined", "Invitation declined"));
    } catch (err: any) {
      toast.error(err.message || "Error");
    } finally {
      setLoadingId(null);
    }
  };

  const getSportLabel = (sportId: string | null) => {
    if (!sportId) return null;
    const sport = sports.find(s => s.id === sportId);
    return sport ? `${sport.emoji} ${sport.label[lang]}` : sportId;
  };

  if (invitations.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Users className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">
          {t("pendingInvites", { count: invitations.length })}
        </span>
      </div>
      <AnimatePresence mode="popLayout">
        {invitations.map((inv) => (
          <motion.div
            key={inv.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-3 border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    {inv.team_avatar_url ? (
                      <img src={inv.team_avatar_url} alt="" className="h-9 w-9 rounded-lg object-cover" />
                    ) : (
                      <Users className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold truncate">{inv.team_name}</span>
                      {inv.team_sport && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1 shrink-0">
                          {getSportLabel(inv.team_sport)}
                        </Badge>
                      )}
                    </div>
                    {inv.inviter_name && (
                      <p className="text-xs text-muted-foreground truncate">
                        {t("invitedBy", "Invited by {{name}}", { name: inv.inviter_name })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => handleDecline(inv)}
                    disabled={loadingId === inv.id}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 gap-1 px-3"
                    onClick={() => handleAccept(inv)}
                    disabled={loadingId === inv.id}
                  >
                    {loadingId === inv.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span className="text-xs">{t("accept", "Accept")}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
