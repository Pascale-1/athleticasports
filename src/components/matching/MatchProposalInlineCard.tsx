import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, X, Loader2, Sparkles } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMatchProposals } from "@/hooks/useMatchProposals";

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
  const { acceptProposal, declineProposal } = useMatchProposals();
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [isCommitted, setIsCommitted] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);

  const handleAcceptClick = () => {
    setShowCommitDialog(true);
  };

  const handleConfirmAccept = async () => {
    if (!isCommitted) return;
    
    setAccepting(true);
    const success = await acceptProposal(proposalId);
    setAccepting(false);
    setShowCommitDialog(false);
    
    if (success) {
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
    <>
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{t('proposal.matchedWithGame')}</p>
              <p className="text-xs text-muted-foreground">{t('proposal.respondBelow')}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={handleAcceptClick}
              disabled={accepting || declining}
            >
              {accepting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  {t('proposal.accept')}
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
                  {t('proposal.decline')}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Commitment Dialog */}
      <AlertDialog open={showCommitDialog} onOpenChange={setShowCommitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('proposal.commitTitle')}</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>{t('proposal.commitDescription')}</p>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
                <Checkbox
                  id="commit-checkbox"
                  checked={isCommitted}
                  onCheckedChange={(checked) => setIsCommitted(checked === true)}
                  className="mt-0.5"
                />
                <label 
                  htmlFor="commit-checkbox" 
                  className="text-sm font-medium cursor-pointer leading-tight"
                >
                  {t('proposal.commitCheckbox')}
                </label>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:actions.cancel', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAccept}
              disabled={!isCommitted || accepting}
            >
              {accepting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {t('proposal.confirmAccept')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
