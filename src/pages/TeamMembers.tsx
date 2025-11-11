import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { PageContainer } from "@/components/mobile/PageContainer";
import { TeamMemberList } from "@/components/teams/TeamMemberList";
import { InviteMemberDialog } from "@/components/teams/InviteMemberDialog";
import { useTeam } from "@/hooks/useTeam";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useTeamInvitations } from "@/hooks/useTeamInvitations";

const TeamMembers = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { team, userRole, canManage } = useTeam(teamId || null);
  const { members, loading: membersLoading, removeMember, updateMemberRole } = useTeamMembers(teamId || null);
  const { invitations, sendInvitation, cancelInvitation, resendInvitation } = useTeamInvitations(teamId || null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  if (membersLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/teams/${teamId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-heading-2 font-bold">Members</h1>
            <p className="text-caption text-muted-foreground">{team?.name}</p>
          </div>
        </div>

        <TeamMemberList
          members={members}
          canManage={canManage}
          currentUserRole={userRole}
          onInvite={() => setInviteDialogOpen(true)}
          onRemoveMember={removeMember}
          onUpdateRole={updateMemberRole}
          invitations={invitations}
          onCancelInvitation={cancelInvitation}
          onResendInvitation={resendInvitation}
        />
      </div>

      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onInvite={sendInvitation}
        teamId={teamId || null}
        canManage={canManage}
      />
    </PageContainer>
  );
};

export default TeamMembers;
