import { TeamMemberCard } from "./TeamMemberCard";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { TeamMemberWithProfile } from "@/lib/teams";

interface TeamMemberListProps {
  members: TeamMemberWithProfile[];
  canManage: boolean;
  currentUserRole: string | null;
  onInvite: () => void;
  onRemoveMember: (memberId: string) => void;
  onUpdateRole: (memberId: string, role: string) => void;
}

export const TeamMemberList = ({
  members,
  canManage,
  currentUserRole,
  onInvite,
  onRemoveMember,
  onUpdateRole,
}: TeamMemberListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Members ({members.length})</h3>
        {canManage && (
          <Button onClick={onInvite}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Members
          </Button>
        )}
      </div>
      <div className="space-y-3">
        {members.map((member) => (
          <TeamMemberCard
            key={member.id}
            member={member}
            canManage={canManage}
            currentUserRole={currentUserRole}
            onRemove={onRemoveMember}
            onChangeRole={onUpdateRole}
          />
        ))}
      </div>
    </div>
  );
};
