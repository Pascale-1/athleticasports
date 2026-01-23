import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, Sparkles } from "lucide-react";
import { useMatchProposals } from "@/hooks/useMatchProposals";
import { useToast } from "@/hooks/use-toast";

interface MatchProposalInlineCardProps {
  proposalId: string;
  onAccepted?: () => void;
  onDeclined?: () => void;
}

export const MatchProposalInlineCard = ({ 
  proposalId, 
  onAccepted,
  onDeclined 
}: MatchProposalInlineCardProps) => {
  const { t } = useTranslation('matching');
  const { toast } = useToast();
  const { acceptProposal, declineProposal } = useMatchProposals();
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);

  // One-click accept - no commitment dialog friction
  const handleAccept = async () => {
    setAccepting(true);
    const success = await acceptProposal(proposalId);
    setAccepting(false);
    
    if (success) {
      toast({ 
        title: t('proposal.youreIn'), 
        description: t('proposal.committedDesc') 
      });
      onAccepted?.();
    }
  };

  const handleDecline = async () => {
    setDeclining(true);
    const success = await declineProposal(proposalId);
    setDeclining(false);
    
    if (success) {
      onDeclined?.();
    }
  };

  return (
    <Card className="border-primary/30 bg-primary/5 mb-4">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{t('proposal.matchFoundTitle')}</p>
            <p className="text-xs text-muted-foreground">{t('proposal.matchFoundDesc')}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={handleAccept}
            disabled={accepting || declining}
          >
            {accepting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Check className="h-4 w-4 mr-1" />
                {t('proposal.joinMatch')}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleDecline}
            disabled={accepting || declining}
          >
            {declining ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <X className="h-4 w-4 mr-1" />
                {t('proposal.notInterested')}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
