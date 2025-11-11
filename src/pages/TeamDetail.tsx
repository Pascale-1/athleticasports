import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamHeader } from "@/components/teams/TeamHeader";
import { TeamMemberList } from "@/components/teams/TeamMemberList";
import { TeamAnnouncements } from "@/components/teams/TeamAnnouncements";
import { TrainingCalendar } from "@/components/teams/TrainingCalendar";
import { InviteMemberDialog } from "@/components/teams/InviteMemberDialog";
import { PerformanceLevelsTab } from "@/components/teams/PerformanceLevelsTab";
import { useTeam } from "@/hooks/useTeam";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useTeamInvitations } from "@/hooks/useTeamInvitations";
import { useTeamAnnouncements } from "@/hooks/useTeamAnnouncements";
import { useTrainingSessions } from "@/hooks/useTrainingSessions";
import { leaveTeam } from "@/lib/teams";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useSwipeableTabs } from "@/hooks/useSwipeableTabs";
import { SwipeableTabContent } from "@/components/animations/SwipeableTabContent";
import { motion } from "framer-motion";

const TeamDetail = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'announcements');

  const tabs = ["announcements", "members", "performance", "training"];
  const { swipeOffset, isSwiping, handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeableTabs({
    tabs,
    activeTab,
    onTabChange: setActiveTab,
  });

  const { team, userRole, isLoading, isMember, canManage } = useTeam(teamId || null);
  const { members, loading: membersLoading, removeMember, updateMemberRole } = useTeamMembers(teamId || null);
  const { sendInvitation, cancelInvitation, resendInvitation, invitations, loading: invitationsLoading } = useTeamInvitations(teamId || null);
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
    <motion.div 
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <TeamHeader
        team={team}
        memberCount={memberCount}
        userRole={userRole}
        canManage={canManage}
        onLeaveTeam={handleLeaveTeam}
      />

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="inline-flex w-full sm:grid sm:grid-cols-4 overflow-x-auto gap-1 sm:gap-0">
            <TabsTrigger value="announcements" className="text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap flex-shrink-0">Announcements</TabsTrigger>
            <TabsTrigger value="members" className="text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap flex-shrink-0">Members</TabsTrigger>
            <TabsTrigger value="performance" className="text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap flex-shrink-0">Performance</TabsTrigger>
            <TabsTrigger value="training" className="text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap flex-shrink-0">Training</TabsTrigger>
          </TabsList>

          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="overflow-hidden"
          >
            <SwipeableTabContent
              activeTab={activeTab}
              tabValue="announcements"
              swipeOffset={swipeOffset}
              isSwiping={isSwiping}
            >
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
            </SwipeableTabContent>

            <SwipeableTabContent
              activeTab={activeTab}
              tabValue="members"
              swipeOffset={swipeOffset}
              isSwiping={isSwiping}
            >
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
                  invitations={invitations}
                  onCancelInvitation={cancelInvitation}
                  onResendInvitation={resendInvitation}
                />
              )}
            </SwipeableTabContent>

            <SwipeableTabContent
              activeTab={activeTab}
              tabValue="performance"
              swipeOffset={swipeOffset}
              isSwiping={isSwiping}
            >
              {membersLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <PerformanceLevelsTab
                  teamId={teamId || ""}
                  members={members}
                  canManage={canManage || userRole === "coach"}
                />
              )}
            </SwipeableTabContent>

            <SwipeableTabContent
              activeTab={activeTab}
              tabValue="training"
              swipeOffset={swipeOffset}
              isSwiping={isSwiping}
            >
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
                  totalMembers={memberCount}
                  onCreateSession={createSession}
                  onUpdateSession={updateSession}
                  onDeleteSession={deleteSession}
                />
              )}
            </SwipeableTabContent>
          </div>
        </Tabs>
      </div>

      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onInvite={sendInvitation}
        teamId={teamId || null}
        canManage={canManage}
      />
    </motion.div>
  );
};

export default TeamDetail;
