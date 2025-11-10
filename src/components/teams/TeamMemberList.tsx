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
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4">
        <h3 className="text-base sm:text-lg font-semibold">Members ({members.length})</h3>
        {canManage && (
          <Button onClick={onInvite} className="w-full sm:w-auto min-h-11">
            <UserPlus className="h-4 w-4 mr-2" />
            <span className="text-xs sm:text-sm">Invite Members</span>
          </Button>
        )}
      </div>
      <div className="space-y-2 sm:space-y-3">
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
