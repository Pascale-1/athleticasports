import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, UserMinus, Shield } from "lucide-react";
import { TeamMemberWithProfile } from "@/lib/teams";

interface TeamMemberCardProps {
  member: TeamMemberWithProfile;
  canManage: boolean;
  currentUserRole: string | null;
  onRemove: (memberId: string) => void;
  onChangeRole: (memberId: string, role: string) => void;
}

const roleColors: Record<string, string> = {
  owner: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900 dark:text-purple-200",
  admin: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200",
  coach: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200",
  member: "bg-muted text-muted-foreground border-border",
};

export const TeamMemberCard = ({
  member,
  canManage,
  currentUserRole,
  onRemove,
  onChangeRole,
}: TeamMemberCardProps) => {
  const canModifyMember = canManage && member.role !== "owner" && currentUserRole === "owner";

  return (
    <Card className="p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0 sm:justify-between">
        <div className="flex items-center gap-3 w-full sm:flex-1 min-w-0">
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
            <AvatarImage src={member.profile.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {member.profile.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm sm:text-base truncate">@{member.profile.username}</p>
            {member.profile.display_name && (
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{member.profile.display_name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Badge variant="outline" className={`${roleColors[member.role]} text-xs flex-shrink-0`}>
            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
          </Badge>
          {canModifyMember && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="min-h-11 min-w-11">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-50">
                <DropdownMenuItem onClick={() => onChangeRole(member.id, "admin")}>
                  <Shield className="h-4 w-4 mr-2" />
                  Make Admin
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChangeRole(member.id, "coach")}>
                  <Shield className="h-4 w-4 mr-2" />
                  Make Coach
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChangeRole(member.id, "member")}>
                  <Shield className="h-4 w-4 mr-2" />
                  Make Member
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onRemove(member.id)}
                  className="text-destructive"
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  Remove Member
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </Card>
  );
};
