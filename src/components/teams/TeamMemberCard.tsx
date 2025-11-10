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
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={member.profile.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {member.profile.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">@{member.profile.username}</p>
            {member.profile.display_name && (
              <p className="text-sm text-muted-foreground">{member.profile.display_name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={roleColors[member.role]}>
            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
          </Badge>
          {canModifyMember && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
