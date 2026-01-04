import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { useTeam } from "@/hooks/useTeam";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useTeamInvitations } from "@/hooks/useTeamInvitations";
import { useTeamAnnouncements } from "@/hooks/useTeamAnnouncements";
import { useEvents } from "@/hooks/useEvents";
import { leaveTeam } from "@/lib/teams";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { isThisWeek } from "date-fns";
import { PageContainer } from "@/components/mobile/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OnboardingHint } from "@/components/onboarding/OnboardingHint";

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

          {/* Team Members Onboarding Hint */}
          <OnboardingHint
            id="hint-team-members"
            icon={UserPlus}
            titleKey="onboarding.teamMembers.title"
            descriptionKey="onboarding.teamMembers.description"
            variant="tip"
            action={canManage ? {
              labelKey: "onboarding.showMe",
              onClick: () => setInviteDialogOpen(true),
            } : undefined}
          />

          <EventsPreview
            events={upcomingSessions}
            teamId={teamId || ""}
            canRSVP={isMember}
          />

          <Card>
            <CardHeader>
              <CardTitle>Team Communication</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="announcements" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="announcements">Announcements</TabsTrigger>
                  <TabsTrigger value="chat">Chat</TabsTrigger>
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
