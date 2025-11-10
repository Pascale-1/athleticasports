import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, X, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
}

export const PendingInvitationsList = ({
  invitations,
  canManage,
  onCancel,
}: PendingInvitationsListProps) => {
  if (invitations.length === 0) {
    return null;
  }

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
                
                {canManage && onCancel && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onCancel(invitation.id)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
