import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { TeamHeader } from "@/components/teams/TeamHeader";
import { TeamQuickStats } from "@/components/teams/TeamQuickStats";
import { TeamAboutSection } from "@/components/teams/TeamAboutSection";
import { NextEventPreview } from "@/components/teams/NextEventPreview";
import { AnnouncementsPreview } from "@/components/teams/AnnouncementsPreview";
import { MembersPreview } from "@/components/teams/MembersPreview";
import { PerformancePreview } from "@/components/teams/PerformancePreview";
import { InviteMemberDialog } from "@/components/teams/InviteMemberDialog";
import { useTeam } from "@/hooks/useTeam";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useTeamInvitations } from "@/hooks/useTeamInvitations";
import { useTeamAnnouncements } from "@/hooks/useTeamAnnouncements";
import { useEvents } from "@/hooks/useEvents";
import { leaveTeam } from "@/lib/teams";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { isThisWeek } from "date-fns";
import { PageContainer } from "@/components/mobile/PageContainer";

const TeamDetail = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const { team, userRole, isLoading, isMember, canManage } = useTeam(teamId || null);
  const { members, loading: membersLoading } = useTeamMembers(teamId || null);
  const { sendInvitation } = useTeamInvitations(teamId || null);
  const {
    announcements,
    loading: announcementsLoading,
    createAnnouncement,
    togglePin,
    deleteAnnouncement,
  } = useTeamAnnouncements(teamId || null);
  const {
    events: sessions,
    loading: sessionsLoading,
  } = useEvents(teamId || null, { includeAsOpponent: true });

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

  const activeMemberCount = members.filter(m => m.status === 'active').length;
  const upcomingSessions = sessions.filter(s => new Date(s.start_time) > new Date());
  const weeklyPosts = announcements.filter(a => isThisWeek(new Date(a.created_at))).length;

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

      <PageContainer>
        <div className="space-y-6 animate-fade-in">
          <TeamQuickStats
            eventCount={upcomingSessions.length}
            activeMemberCount={activeMemberCount}
            weeklyPosts={weeklyPosts}
            loading={membersLoading || sessionsLoading || announcementsLoading}
          />

          <TeamAboutSection description={team.description} />

          <NextEventPreview
            event={upcomingSessions[0] || null}
            teamId={teamId || ""}
            canRSVP={isMember}
          />

          <AnnouncementsPreview
            announcements={announcements}
            canPost={isMember}
            canManage={canManage}
            currentUserId={currentUserId}
            onPost={createAnnouncement}
            onTogglePin={togglePin}
            onDelete={deleteAnnouncement}
            teamId={teamId || ""}
          />

          <MembersPreview
            members={members}
            canInvite={canManage}
            onInvite={() => setInviteDialogOpen(true)}
            teamId={teamId || ""}
          />

          <PerformancePreview
            teamId={teamId || ""}
            memberCount={memberCount}
          />
        </div>
      </PageContainer>

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
