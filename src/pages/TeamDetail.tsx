import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamHeader } from "@/components/teams/TeamHeader";
import { TeamMemberList } from "@/components/teams/TeamMemberList";
import { TeamAnnouncements } from "@/components/teams/TeamAnnouncements";
import { TrainingCalendar } from "@/components/teams/TrainingCalendar";
import { InviteMemberDialog } from "@/components/teams/InviteMemberDialog";
import { useTeam } from "@/hooks/useTeam";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useTeamInvitations } from "@/hooks/useTeamInvitations";
import { useTeamAnnouncements } from "@/hooks/useTeamAnnouncements";
import { useTrainingSessions } from "@/hooks/useTrainingSessions";
import { leaveTeam } from "@/lib/teams";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const TeamDetail = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const { team, userRole, isLoading, isMember, canManage } = useTeam(teamId || null);
  const { members, loading: membersLoading, removeMember, updateMemberRole } = useTeamMembers(teamId || null);
  const { sendInvitation } = useTeamInvitations(teamId || null);
  const {
    announcements,
    loading: announcementsLoading,
    createAnnouncement,
    togglePin,
    deleteAnnouncement,
  } = useTeamAnnouncements(teamId || null);
  const {
    sessions,
    loading: sessionsLoading,
    createSession,
    updateSession,
    deleteSession,
  } = useTrainingSessions(teamId || null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (teamId) {
      const fetchMemberCount = async () => {
        const { data } = await supabase.rpc("get_team_member_count", {
          _team_id: teamId,
        });
        if (data !== null) {
          setMemberCount(data);
        }
      };
      fetchMemberCount();
    }
  }, [teamId, members]);

  const handleLeaveTeam = async () => {
    if (!teamId) return;
    
    try {
      await leaveTeam(teamId);
      toast({
        title: "Success",
        description: "You have left the team",
      });
      navigate("/teams");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to leave team",
        variant: "destructive",
      });
    }
  };

  if (isLoading || !team) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You are not a member of this team</p>
        </div>
      </div>
    );
  }

  const canCreateSession = canManage || userRole === "coach";

  return (
    <div className="min-h-screen bg-background">
      <TeamHeader
        team={team}
        memberCount={memberCount}
        userRole={userRole}
        canManage={canManage}
        onLeaveTeam={handleLeaveTeam}
      />

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="announcements" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
          </TabsList>

          <TabsContent value="announcements" className="space-y-4">
            {announcementsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <TeamAnnouncements
                announcements={announcements}
                canPost={isMember}
                canManage={canManage}
                currentUserId={currentUserId}
                onPost={createAnnouncement}
                onTogglePin={togglePin}
                onDelete={deleteAnnouncement}
              />
            )}
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            {membersLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <TeamMemberList
                members={members}
                canManage={canManage}
                currentUserRole={userRole}
                onInvite={() => setInviteDialogOpen(true)}
                onRemoveMember={removeMember}
                onUpdateRole={updateMemberRole}
              />
            )}
          </TabsContent>

          <TabsContent value="training" className="space-y-4">
            {sessionsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <TrainingCalendar
                sessions={sessions}
                canCreateSession={canCreateSession}
                canManage={canManage}
                currentUserId={currentUserId}
                onCreateSession={createSession}
                onUpdateSession={updateSession}
                onDeleteSession={deleteSession}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onInvite={sendInvitation}
      />
    </div>
  );
};

export default TeamDetail;
