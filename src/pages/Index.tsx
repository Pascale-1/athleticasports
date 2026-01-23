import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@supabase/supabase-js";
import { Trophy, Users, TrendingUp, Swords, UserPlus, Search, Sparkles, Plus, CalendarCheck, ChevronRight } from "lucide-react";
import { ActivityCard } from "@/components/feed/ActivityCard";
import { FeedSkeleton } from "@/components/feed/FeedSkeleton";
import { useActivityFeed } from "@/hooks/useActivityFeed";
import { PageContainer } from "@/components/mobile/PageContainer";
import { PullToRefresh } from "@/components/animations/PullToRefresh";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useEvents } from "@/hooks/useEvents";
import { CreateEventDialog } from "@/components/events/CreateEventDialog";
import { FindMatchSheet } from "@/components/matching/FindMatchSheet";
import { usePlayerAvailability } from "@/hooks/usePlayerAvailability";
import { useMatchProposals } from "@/hooks/useMatchProposals";
import { MatchProposalCard } from "@/components/matching/MatchProposalCard";
import { formatDateTimeShort } from "@/lib/dateUtils";
import { LanguageToggle } from "@/components/settings/LanguageToggle";
import { OnboardingHint } from "@/components/onboarding/OnboardingHint";
import { useAppWalkthrough } from "@/hooks/useAppWalkthrough";
import { LogoutButton } from "@/components/settings/LogoutButton";
import { useAvailableGames } from "@/hooks/useAvailableGames";
import { AvailableGameCard } from "@/components/matching/AvailableGameCard";

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  primary_sport: string | null;
}

interface Stats {
  teams: number;
  upcomingMatches: number;
  followers: number;
}

const Index = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats>({ teams: 0, upcomingMatches: 0, followers: 0 });
  const [loading, setLoading] = useState(true);
  const [createEventDialogOpen, setCreateEventDialogOpen] = useState(false);
  const [findMatchSheetOpen, setFindMatchSheetOpen] = useState(false);
  const { activities, loading: feedLoading, loadingMore, hasMore, loadMore } = useActivityFeed();
  
  // Fetch upcoming matches
  const { events: allMatches, loading: matchesLoading } = useEvents(undefined, { status: 'upcoming' });
  const upcomingMatches = allMatches.filter(e => e.type === 'match').slice(0, 3);
  
  // Fetch available games (looking for players)
  const { games: availableGames, loading: gamesLoading } = useAvailableGames();
  const topAvailableGames = availableGames.slice(0, 3);
  
  // Fetch match status (proposals & availability)
  const { availability } = usePlayerAvailability();
  const { proposals, acceptProposal, declineProposal, loading: proposalsLoading } = useMatchProposals();
  const pendingProposals = proposals.filter(p => p.status === 'pending');
  
  // Walkthrough
  const { startWalkthrough, shouldTrigger, clearTrigger } = useAppWalkthrough();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => fetchProfile(session.user.id), 0);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Auto-trigger walkthrough after onboarding
  useEffect(() => {
    if (!loading && profile && shouldTrigger()) {
      clearTrigger();
      startWalkthrough();
    }
  }, [loading, profile, shouldTrigger, clearTrigger, startWalkthrough]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      setProfile(data);

      if (data) {
        await fetchStats(userId);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (userId: string) => {
    try {
      const { count: teamsCount } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const { count: followersCount } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      // Count upcoming matches
      const { count: matchesCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'match')
        .gte('start_time', new Date().toISOString());

      setStats({
        teams: teamsCount || 0,
        upcomingMatches: matchesCount || 0,
        followers: followersCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRefresh = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">{t('actions.loading')}</div>
        </div>
      </PageContainer>
    );
  }

  if (!profile) {
    return (
      <PageContainer>
        <Card className="max-w-md mx-auto p-6 text-center space-y-4">
          <Trophy className="h-12 w-12 mx-auto text-primary" />
          <h2 className="text-xl font-bold">{t('home.completeProfile')}</h2>
          <p className="text-muted-foreground text-sm">
            {t('home.completeProfileDesc')}
          </p>
          <Button onClick={() => navigate("/settings")} className="w-full">
            {t('home.createProfile')}
          </Button>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer bottomPadding={false}>
      <PullToRefresh onRefresh={handleRefresh}>
        <motion.div 
          className="space-y-6 pb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Hero Section with Merged Stats */}
          <AnimatedCard delay={0.1}>
            <Card data-walkthrough="profile" className="p-4 space-y-3 relative">
              {/* Language Toggle & Logout */}
              <div className="absolute top-2 right-2 flex items-center gap-1">
                <LanguageToggle />
                <LogoutButton variant="header" />
              </div>
              
              <div className="flex items-center gap-3">
                <Avatar size="xl" ring="coral">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-heading-3 bg-primary/10 text-primary">
                    {profile.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h1 className="text-heading-2 font-bold break-words max-w-full">
                    {t('home.welcome', { name: profile.display_name || profile.username })}
                  </h1>
                  <p className="text-body text-muted-foreground">{t('home.readyToPlay')}</p>
                </div>
              </div>

              {/* Compact Stats Row */}
              <div className="flex items-center justify-around border-t pt-3">
                <button 
                  onClick={() => navigate("/teams?filter=my-teams")}
                  className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all hover:bg-muted active:scale-95 min-h-[44px] min-w-[44px]"
                >
                  <Users className="h-4 w-4 text-primary" />
                  <p className="text-body-large font-bold">{stats.teams}</p>
                  <p className="text-caption text-muted-foreground">{t('home.teams')}</p>
                </button>
                <button
                  onClick={() => navigate("/events?type=match")}
                  className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all hover:bg-muted active:scale-95 min-h-[44px] min-w-[44px]"
                >
                  <Swords className="h-4 w-4 text-primary" />
                  <p className="text-body-large font-bold">{stats.upcomingMatches}</p>
                  <p className="text-caption text-muted-foreground">{t('home.games')}</p>
                </button>
                <button
                  onClick={() => navigate("/settings")}
                  className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all hover:bg-muted active:scale-95 min-h-[44px] min-w-[44px]"
                >
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <p className="text-body-large font-bold">{stats.followers}</p>
                  <p className="text-caption text-muted-foreground">{t('home.followers')}</p>
                </button>
              </div>
            </Card>
          </AnimatedCard>

          {/* Welcome Hint */}
          <OnboardingHint
            id="hint-welcome"
            icon={Sparkles}
            titleKey="onboarding.welcome.title"
            descriptionKey="onboarding.welcome.description"
            variant="tip"
          />

          {/* Quick Actions - 3 buttons: Availability, Organize, Create Team */}
          <AnimatedCard delay={0.2}>
            <div data-walkthrough="quick-actions" className="grid grid-cols-3 gap-2">
              <Button 
                variant="default"
                className="flex flex-col items-center justify-center gap-2 h-16 px-2 bg-green-600 hover:bg-green-700 overflow-hidden"
                onClick={() => setFindMatchSheetOpen(true)}
              >
                <CalendarCheck className="h-5 w-5 flex-shrink-0" />
                <span className="text-xs font-medium text-center truncate max-w-full">{t('home.findGame')}</span>
              </Button>
              
              <Button 
                variant="outline"
                className="flex flex-col items-center justify-center gap-2 h-16 px-2 overflow-hidden"
                onClick={() => setCreateEventDialogOpen(true)}
              >
                <Plus className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-xs font-medium text-center truncate max-w-full">{t('home.organizeEvent')}</span>
              </Button>
              
              <Button 
                type="button"
                variant="outline"
                className="flex flex-col items-center justify-center gap-2 h-16 px-2 overflow-hidden"
                onClick={() => navigate("/teams/create")}
              >
                <Users className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-xs font-medium text-center truncate max-w-full">{t('home.createTeam')}</span>
              </Button>
            </div>
          </AnimatedCard>

          {/* Games This Week Section - Open games looking for players */}
          {!gamesLoading && topAvailableGames.length > 0 && (
            <AnimatedCard delay={0.25}>
              <Card className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <h2 className="text-heading-3 font-semibold">{t('matching.gamesThisWeek')}</h2>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary min-h-[44px]"
                    onClick={() => navigate("/events?tab=open")}
                  >
                    {t('matching.viewAll')}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {topAvailableGames.map((game) => (
                    <AvailableGameCard 
                      key={game.id} 
                      game={game} 
                      compact 
                    />
                  ))}
                </div>
              </Card>
            </AnimatedCard>
          )}

          {/* Unified Matches Section - Combines status + upcoming */}
          <AnimatedCard delay={0.3}>
            <Card data-walkthrough="games" className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Swords className="h-5 w-5 text-primary" />
                  <h2 className="text-heading-3 font-semibold">{t('home.games')}</h2>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary min-h-[44px]"
                  onClick={() => navigate("/events?type=match")}
                >
                  {t('actions.viewAll')}
                </Button>
              </div>
              
              {/* Pending Match Proposals */}
              {pendingProposals.length > 0 && (
                <div className="space-y-2 border-b pb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {pendingProposals.length} {t('status.pending').toLowerCase()}
                    </Badge>
                  </div>
                  {pendingProposals.slice(0, 2).map((proposal) => (
                    <MatchProposalCard
                      key={proposal.id}
                      proposal={proposal}
                      onAccept={() => acceptProposal(proposal.id)}
                      onDecline={() => declineProposal(proposal.id)}
                    />
                  ))}
                </div>
              )}
              
              {/* Active Availability Status */}
              {availability && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-primary" />
                    <span className="font-medium">{t('home.lookingFor', { sport: availability.sport })}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {availability.location_district || availability.location || t('home.anyLocation')}
                  </p>
                </div>
              )}
              
              {/* Upcoming Matches List */}
              {matchesLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : upcomingMatches.length > 0 ? (
                <div className="space-y-2">
                  {upcomingMatches.map((match) => (
                    <div 
                      key={match.id}
                      onClick={() => navigate(`/events/${match.id}`)}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Trophy className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{match.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTimeShort(match.start_time)}
                        </p>
                      </div>
                      {match.max_participants && (
                        <Badge variant="secondary" className="flex-shrink-0">
                          <UserPlus className="h-3 w-3 mr-1" />
                          {t('home.open')}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : !pendingProposals.length && !availability ? (
                <div className="text-center py-6">
                  <Swords className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">{t('home.noUpcomingGames')}</p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">{t('home.lookingToPlay')}</p>
                      <Button 
                        size="sm"
                        variant="default"
                        onClick={() => setFindMatchSheetOpen(true)}
                      >
                        <CalendarCheck className="h-4 w-4 mr-1" />
                        {t('home.setAvailability')}
                      </Button>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">{t('home.wantToOrganize')}</p>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => setCreateEventDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {t('home.createEvent')}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
            </Card>
          </AnimatedCard>

          {/* Activity Feed */}
          <motion.div 
            data-walkthrough="feed"
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-heading-3 font-semibold">{t('home.activityFeed')}</h2>

            {feedLoading ? (
              <FeedSkeleton />
            ) : activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <AnimatedCard key={activity.id} delay={0.4 + index * 0.05} hover={false}>
                    <ActivityCard {...activity} />
                  </AnimatedCard>
                ))}
                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="min-h-[44px]"
                    >
                      {loadingMore ? t('actions.loading') : t('actions.loadMore')}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <h3 className="font-semibold mb-2">{t('home.noActivities')}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('home.noActivitiesDesc')}
                </p>
                <Button onClick={() => navigate("/teams")} variant="outline">
                  {t('home.browseTeams')}
                </Button>
              </Card>
            )}
          </motion.div>
        </motion.div>
      </PullToRefresh>

      <CreateEventDialog
        open={createEventDialogOpen}
        onOpenChange={setCreateEventDialogOpen}
      />
      
      <FindMatchSheet
        open={findMatchSheetOpen}
        onOpenChange={setFindMatchSheetOpen}
      />
    </PageContainer>
  );
};

export default Index;
