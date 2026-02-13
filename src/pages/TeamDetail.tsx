import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { TeamHeader } from "@/components/teams/TeamHeader";
import { TeamQuickStats } from "@/components/teams/TeamQuickStats";
import { TeamAboutSection } from "@/components/teams/TeamAboutSection";
import { EventsPreview } from "@/components/teams/EventsPreview";
import { MembersPreview } from "@/components/teams/MembersPreview";
import { PerformancePreview } from "@/components/teams/PerformancePreview";
import { InviteMemberDialog } from "@/components/teams/InviteMemberDialog";
import { TeamAnnouncements } from "@/components/teams/TeamAnnouncements";
import { TeamChat } from "@/components/teams/TeamChat";
import { PageHeader } from "@/components/mobile/PageHeader";
import { useTeam } from "@/hooks/useTeam";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useTeamInvitations } from "@/hooks/useTeamInvitations";
import { useTeamAnnouncements } from "@/hooks/useTeamAnnouncements";
import { useEvents } from "@/hooks/useEvents";
import { leaveTeam } from "@/lib/teams";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { isThisWeek } from "date-fns";
import { PageContainer } from "@/components/mobile/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OnboardingHint } from "@/components/onboarding/OnboardingHint";

const TeamDetail = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('teams');
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
        title: t('toast.leaveSuccess'),
        description: t('toast.leaveSuccess'),
      });
      navigate("/teams");
    } catch (error) {
      toast({
        title: t('toast.leaveError'),
        description: t('toast.leaveError'),
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

  const handleJoinTeam = async () => {
    if (!teamId || !currentUserId) return;
    try {
      // Insert into team_members
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .insert({ team_id: teamId, user_id: currentUserId, status: 'active' })
        .select('id')
        .single();
      if (memberError) throw memberError;

      // Assign member role
      const { error: roleError } = await supabase
        .from('team_member_roles')
        .insert({ team_member_id: memberData.id, role: 'member' });
      if (roleError) throw roleError;

      toast({
        title: t('toast.joinSuccess', { name: team?.name }),
      });
      // Reload to show full team view
      window.location.reload();
    } catch (error) {
      toast({
        title: t('toast.joinError'),
        variant: "destructive",
      });
    }
  };

  if (!isMember) {
    // Private teams: invite-only preview
    if (team.is_private) {
      return (
        <motion.div 
          className="min-h-screen bg-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <PageHeader
            title=""
            showBackButton={true}
            backPath="/teams"
            className="px-4 pt-4 pb-0"
          />
          <TeamHeader
            team={team}
            memberCount={memberCount}
            userRole={userRole}
            canManage={false}
            onLeaveTeam={() => {}}
          />
          <PageContainer>
            <div className="space-y-4 text-center py-6">
              <Lock className="h-10 w-10 mx-auto text-muted-foreground" />
              <h2 className="text-xl font-heading font-bold">{t('access.denied')}</h2>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">{t('access.notMember')}</p>
            </div>
          </PageContainer>
        </motion.div>
      );
    }

    // Public teams: show preview with join button
    return (
      <motion.div 
        className="min-h-screen bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <PageHeader
          title=""
          showBackButton={true}
          backPath="/teams"
          className="px-4 pt-4 pb-0"
        />
        <TeamHeader
          team={team}
          memberCount={memberCount}
          userRole={userRole}
          canManage={false}
          onLeaveTeam={() => {}}
        />
        <PageContainer>
          <div className="space-y-4 text-center py-6">
            <p className="text-muted-foreground">{t('access.publicTeamPreview')}</p>
            <Button size="lg" onClick={handleJoinTeam} className="gap-2">
              <Users className="h-5 w-5" />
              {t('access.joinTeam')}
            </Button>
          </div>
        </PageContainer>
      </motion.div>
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
      {/* Back Button */}
      <PageHeader
        title=""
        showBackButton={true}
        backPath="/teams"
        className="px-4 pt-4 pb-0"
      />

      <TeamHeader
        team={team}
        memberCount={memberCount}
        userRole={userRole}
        canManage={canManage}
        onLeaveTeam={handleLeaveTeam}
      />

      <PageContainer>
        <div className="space-y-6 animate-fade-in">
          {/* 1. Quick Stats - First impression */}
          <TeamQuickStats
            eventCount={upcomingSessions.length}
            activeMemberCount={activeMemberCount}
            weeklyPosts={weeklyPosts}
            loading={membersLoading || sessionsLoading || announcementsLoading}
          />

          {/* 2. Events Preview - Most actionable */}
          <EventsPreview
            events={upcomingSessions}
            teamId={teamId || ""}
            canRSVP={isMember}
          />

          {/* 3. Members Preview - Who's on the team */}
          <MembersPreview
            members={members}
            canInvite={canManage}
            onInvite={() => setInviteDialogOpen(true)}
            teamId={teamId || ""}
          />

          {/* Team Members Onboarding Hint */}
          {canManage && (
            <OnboardingHint
              id="hint-team-members"
              icon={UserPlus}
              titleKey="onboarding.teamMembers.title"
              descriptionKey="onboarding.teamMembers.description"
              variant="tip"
              action={{
                labelKey: "onboarding.showMe",
                onClick: () => setInviteDialogOpen(true),
              }}
            />
          )}

          {/* 4. About Section - Context */}
          <TeamAboutSection description={team.description} />

          {/* 5. Communication - Announcements + Chat */}
          <Card>
            <CardHeader>
              <CardTitle>{t('communication.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="announcements" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="announcements">{t('communication.announcements')}</TabsTrigger>
                  <TabsTrigger value="chat">{t('communication.chat')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="announcements" className="mt-4">
                  <TeamAnnouncements
                    announcements={announcements}
                    canPost={isMember}
                    canManage={canManage}
                    currentUserId={currentUserId}
                    onPost={createAnnouncement}
                    onTogglePin={togglePin}
                    onDelete={deleteAnnouncement}
                  />
                </TabsContent>
                
                <TabsContent value="chat" className="mt-4">
                  <TeamChat teamId={teamId || ""} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* 6. Performance Preview - Advanced feature */}
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
