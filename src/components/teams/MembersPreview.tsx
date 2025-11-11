import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, UserPlus, Crown, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { TeamMemberWithProfile } from "@/lib/teams";

interface MembersPreviewProps {
  members: TeamMemberWithProfile[];
  canInvite: boolean;
  onInvite: () => void;
  teamId: string;
}

export const MembersPreview = ({ members, canInvite, onInvite, teamId }: MembersPreviewProps) => {
  const activeMembers = members.filter(m => m.status === 'active');
  const managers = activeMembers.filter(m => m.role === 'owner' || m.role === 'admin');
  const regularMembers = activeMembers.filter(m => m.role !== 'owner' && m.role !== 'admin');

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-body-large font-semibold">Members ({activeMembers.length})</h3>
          <div className="flex gap-2">
            {canInvite && (
              <Button variant="outline" size="sm" onClick={onInvite}>
                <UserPlus className="h-4 w-4 mr-1" />
                Invite
              </Button>
            )}
            <Link to={`/teams/${teamId}/members`}>
              <Button variant="ghost" size="sm" className="text-primary">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Managers Section */}
        {managers.length > 0 && (
          <div className="mb-4">
            <p className="text-caption text-muted-foreground mb-2">Team Leaders</p>
            <div className="flex gap-2">
              {managers.slice(0, 2).map((member) => (
                <div key={member.id} className="flex items-center gap-2 bg-muted p-2 rounded-lg flex-1">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.profile.avatar_url || undefined} />
                    <AvatarFallback>
                      {(member.profile.display_name || member.profile.username).substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-caption font-medium truncate">
                      {member.profile.display_name || member.profile.username}
                    </p>
                    <div className="flex items-center gap-1">
                      {member.role === 'owner' ? (
                        <Crown className="h-3 w-3 text-primary" />
                      ) : (
                        <Shield className="h-3 w-3 text-primary" />
                      )}
                      <p className="text-[10px] text-muted-foreground capitalize">{member.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Members Grid */}
        {regularMembers.length > 0 && (
          <div>
            <p className="text-caption text-muted-foreground mb-2">Members</p>
            <div className="grid grid-cols-4 gap-3">
              {regularMembers.slice(0, 8).map((member) => (
                <div key={member.id} className="flex flex-col items-center gap-1">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.profile.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {(member.profile.display_name || member.profile.username).substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-[10px] text-center truncate w-full">
                    {member.profile.display_name || member.profile.username}
                  </p>
                </div>
              ))}
            </div>
            {regularMembers.length > 8 && (
              <p className="text-caption text-muted-foreground text-center mt-3">
                +{regularMembers.length - 8} more
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
