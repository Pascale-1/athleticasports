import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Calendar, 
  MapPin, 
  Users, 
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2,
  Trophy
} from "lucide-react";
import { format } from "date-fns";
import { MatchProposal } from "@/hooks/useMatchProposals";
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

interface MatchProposalCardProps {
  proposal: MatchProposal;
  onAccept: (id: string) => Promise<boolean>;
  onDecline: (id: string) => Promise<boolean>;
}

export const MatchProposalCard = ({ proposal, onAccept, onDecline }: MatchProposalCardProps) => {
  const [showCommitmentDialog, setShowCommitmentDialog] = useState(false);
  const [commitmentChecked, setCommitmentChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const event = proposal.event;
  if (!event) return null;

  const handleAcceptClick = () => {
    setShowCommitmentDialog(true);
    setCommitmentChecked(false);
  };

  const handleConfirmAccept = async () => {
    if (!commitmentChecked) return;
    
    setLoading(true);
    try {
      await onAccept(proposal.id);
      setShowCommitmentDialog(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      await onDecline(proposal.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="border-l-4 border-l-primary overflow-hidden">
        <CardContent className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  <Trophy className="h-3 w-3 mr-1" />
                  Match Found
                </Badge>
              </div>
              <h3 className="font-semibold text-lg truncate">{event.title}</h3>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>
                {format(new Date(event.start_time), "EEEE, MMMM d")} at{" "}
                {format(new Date(event.start_time), "h:mm a")}
              </span>
            </div>
            
            {event.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            )}

            {event.players_needed && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4 flex-shrink-0" />
                <span>{event.players_needed} players needed</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1"
              onClick={handleAcceptClick}
              disabled={loading}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Accept
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDecline}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Decline
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Commitment Dialog */}
      <AlertDialog open={showCommitmentDialog} onOpenChange={setShowCommitmentDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Commitment Required
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                By accepting this match, you are <strong>committing to attend</strong>. 
                This is a binding commitment to ensure fair play for all participants.
              </p>
              
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-sm font-medium text-warning">
                  ⚠️ Cancellations are not allowed after accepting
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Please only accept if you are certain you can attend.
                </p>
              </div>

              <div className="flex items-start space-x-3 pt-2">
                <Checkbox
                  id="commitment"
                  checked={commitmentChecked}
                  onCheckedChange={(checked) => setCommitmentChecked(checked === true)}
                />
                <label
                  htmlFor="commitment"
                  className="text-sm leading-tight cursor-pointer"
                >
                  I understand and commit to attending this match on{" "}
                  <strong>
                    {format(new Date(event.start_time), "EEEE, MMMM d")}
                  </strong>
                </label>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAccept}
              disabled={!commitmentChecked || loading}
              className="bg-primary"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Accept & Commit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
