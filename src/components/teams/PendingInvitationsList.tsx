import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, X, Clock, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
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
import { useState } from "react";

export interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  invited_user_id: string | null;
}

interface PendingInvitationsListProps {
  invitations: PendingInvitation[];
  canManage: boolean;
  onCancel?: (invitationId: string) => void;
  onResend?: (invitationId: string) => void;
}

export const PendingInvitationsList = ({
  invitations,
  canManage,
  onCancel,
  onResend,
}: PendingInvitationsListProps) => {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedInvitationId, setSelectedInvitationId] = useState<string | null>(null);

  if (invitations.length === 0) {
    return null;
  }

  const handleCancelClick = (invitationId: string) => {
    setSelectedInvitationId(invitationId);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    if (selectedInvitationId && onCancel) {
      onCancel(selectedInvitationId);
      setCancelDialogOpen(false);
      setSelectedInvitationId(null);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default";
      case "admin":
        return "secondary";
      case "coach":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">Pending Invitations</h3>
        <Badge variant="secondary">{invitations.length}</Badge>
      </div>
      
      <div className="grid gap-3">
        {invitations.map((invitation) => (
          <Card key={invitation.id} className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-10 w-10 bg-muted">
                  <AvatarFallback>
                    <Mail className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{invitation.email}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      Invited {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={getRoleBadgeVariant(invitation.role)}>
                  {invitation.role}
                </Badge>
                
                {canManage && (
                  <>
                    {onResend && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onResend(invitation.id)}
                        className="h-8 w-8"
                        title="Resend invitation"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                    {onCancel && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCancelClick(invitation.id)}
                        className="h-8 w-8"
                        title="Cancel invitation"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this invitation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel}>Yes, cancel</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
