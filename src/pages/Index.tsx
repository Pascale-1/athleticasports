import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Users, Swords, UserPlus, Search, Sparkles, Plus, CalendarCheck, ChevronRight, Camera, Megaphone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getEventTypeEmoji } from "@/lib/eventIcons";
import { ActivityCard } from "@/components/feed/ActivityCard";
import { FeedSkeleton } from "@/components/feed/FeedSkeleton";
import { useActivityFeed } from "@/hooks/useActivityFeed";
import { PageContainer } from "@/components/mobile/PageContainer";
import { PullToRefresh } from "@/components/animations/PullToRefresh";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useUserEvents } from "@/hooks/useUserEvents";
import { CreateEventDialog } from "@/components/events/CreateEventDialog";
import { FindMatchSheet } from "@/components/matching/FindMatchSheet";
import { usePlayerAvailability } from "@/hooks/usePlayerAvailability";
import { formatDateTimeShort } from "@/lib/dateUtils";
import { OnboardingHint } from "@/components/onboarding/OnboardingHint";
import { useAppWalkthrough, isFullWalkthroughActive } from "@/hooks/useAppWalkthrough";
import { useAvailableGames } from "@/hooks/useAvailableGames";
import { AvailableGameCard } from "@/components/matching/AvailableGameCard";
import { isToday, isTomorrow } from "date-fns";
import { LanguageToggle } from "@/components/settings/LanguageToggle";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { useMatchProposals } from "@/hooks/useMatchProposals";
import { MatchProposalInlineCard } from "@/components/matching/MatchProposalInlineCard";



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
  eventsAttended: number;
}

const Index = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'matching']);
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats>({ teams: 0, upcomingMatches: 0, eventsAttended: 0 });
  const [loading, setLoading] = useState(true);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [createEventDialogOpen, setCreateEventDialogOpen] = useState(false);
  const [findMatchSheetOpen, setFindMatchSheetOpen] = useState(false);
  const { activities, loading: feedLoading, loadingMore, hasMore, loadMore } = useActivityFeed();
  
  // Fetch user's upcoming events (all types)
  const { events: userEvents, loading: eventsLoading } = useUserEvents({ 
    status: 'upcoming' 
  });
  const upcomingEvents = userEvents.slice(0, 3);
  
  // Fetch available games (looking for players)
  const { games: availableGames, loading: gamesLoading } = useAvailableGames();
  const topAvailableGames = availableGames.slice(0, 3);
  
  // Fetch match status (proposals & availability)
  const { availability } = usePlayerAvailability();
  const { proposals: matchProposals, loading: proposalsLoading, refetch: refetchProposals } = useMatchProposals();
  
  // Walkthrough
  const { startWalkthrough, startFullWalkthrough, continueFullWalkthrough, shouldTrigger, clearTrigger, hasCompleted } = useAppWalkthrough();

  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  // Auto-trigger walkthrough after onboarding or on first visit
  useEffect(() => {
    if (!loading && profile) {
      if (shouldTrigger()) {
        clearTrigger();
        startFullWalkthrough(navigate);
        return;
      }
      if (isFullWalkthroughActive()) {
        continueFullWalkthrough('home', navigate);
      } else if (!hasCompleted('home')) {
        startWalkthrough('home');
      }
    }
  }, [loading, profile, shouldTrigger, clearTrigger, startWalkthrough, startFullWalkthrough, continueFullWalkthrough, hasCompleted, navigate]);

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
      const teamsRes = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      setStats(prev => ({
        ...prev,
        teams: teamsRes.count || 0,
      }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Derive match & event counts from already-fetched userEvents
  useEffect(() => {
    if (!eventsLoading) {
      setStats(prev => ({
        ...prev,
        upcomingMatches: userEvents.filter(e => e.type === 'match').length,
        eventsAttended: userEvents.length,
      }));
    }
  }, [userEvents, eventsLoading]);

  const handleRefresh = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  if (loading || authLoading || !profile) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">{t('actions.loading')}</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer bottomPadding={false}>
      <PullToRefresh onRefresh={handleRefresh}>
          <motion.div 
            className="space-y-3 pb-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Top Header Row - Utilities */}
          <div className="flex items-center justify-end gap-1 -mb-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs gap-1.5 text-muted-foreground hover:text-primary hover:border-primary/50"
              onClick={() => setFeedbackOpen(true)}
            >
              <Megaphone className="h-3.5 w-3.5" />
              {t('feedback.title')}
            </Button>
            <LanguageToggle />
          </div>

          {/* Greeting Section - Clean typographic */}
          <div data-walkthrough="home-next-event">
          <AnimatedCard delay={0.1}>
            <div className="space-y-0.5">
              <h1 className="text-[18px] font-bold tracking-tight">
                {t('home.greeting', { name: profile.display_name || profile.username })}
              </h1>
              <p className="text-[12px] text-muted-foreground">
                {t('home.greetingSubtitle')}
              </p>
            </div>
          </AnimatedCard>

          {/* Next Match Hero Card */}
          {!eventsLoading && upcomingEvents.length > 0 && (
            <AnimatedCard delay={0.12}>
              <div className="relative">
                {/* Subtle radial glow behind hero */}
                <div className="absolute inset-0 -top-8 -left-4 -right-4 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(56,189,248,0.07) 0%, transparent 60%)' }} />
                <Link to={`/events/${upcomingEvents[0].id}`} className="relative z-10">
                  <Card className="p-4 bg-card border border-border active:scale-[0.98] transition-transform">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground mb-1">
                      {t('home.nextEvent')}
                    </p>
                    <h2 className="text-[20px] font-bold leading-tight text-foreground">
                      {upcomingEvents[0].title}
                    </h2>
                    <p className="text-[17px] font-semibold text-primary mt-1">
                      {formatDateTimeShort(upcomingEvents[0].start_time)}
                    </p>
                    {upcomingEvents[0].location && (
                      <p className="text-[12px] text-muted-foreground mt-1 truncate">
                        📍 {upcomingEvents[0].location}
                      </p>
                    )}
                  </Card>
                </Link>
              </div>
            </AnimatedCard>
          )}

          {/* Stats Grid — standalone section */}
          <AnimatedCard delay={0.15}>
            <div data-walkthrough="home-stats" className="flex items-stretch justify-center">
              <button 
                onClick={() => navigate("/teams?filter=my-teams")}
                className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all hover:bg-muted active:scale-95 min-h-[52px]"
              >
                <span className="text-[28px] font-bold text-foreground leading-none tabular-nums">{stats.teams}</span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.08em]">{t('home.teams')}</span>
              </button>
              <div className="w-px bg-muted self-stretch my-2" />
              <button
                onClick={() => navigate("/events?tab=my&type=match")}
                className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all hover:bg-muted active:scale-95 min-h-[52px]"
              >
                <span className="text-[28px] font-bold text-foreground leading-none tabular-nums">{stats.upcomingMatches}</span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.08em]">{t('home.games')}</span>
              </button>
              <div className="w-px bg-muted self-stretch my-2" />
              <button
                onClick={() => navigate("/events?tab=my")}
                className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all hover:bg-muted active:scale-95 min-h-[52px]"
              >
                <span className="text-[28px] font-bold text-foreground leading-none tabular-nums">{stats.eventsAttended}</span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.08em]">{t('home.eventsAttended')}</span>
              </button>
            </div>
          </AnimatedCard>
          </div>

          {/* Welcome Hint */}
          <OnboardingHint
            id="hint-welcome"
            icon={Sparkles}
            titleKey="onboarding.welcome.title"
            descriptionKey="onboarding.welcome.description"
            variant="tip"
          />

          {/* Quick Actions - 2x2 Grid Primary + Secondary */}
          <AnimatedCard delay={0.2}>
            <div data-walkthrough="home-quick-actions" className="space-y-2">
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  className="flex-1 flex items-center gap-2 h-11 rounded-xl bg-card border-border active:scale-[0.98]"
                  onClick={() => setFindMatchSheetOpen(true)}
                >
                  <Search className="h-5 w-5 shrink-0" />
                  <div className="text-left">
                    <span className="text-sm font-medium block">{t('home.findGame')}</span>
                    <span className="text-[11px] text-muted-foreground block">{t('home.findGameSubtitle')}</span>
                  </div>
                </Button>
                
                <Button 
                  variant="default"
                  className="flex-1 flex items-center gap-2 h-11 rounded-xl active:scale-[0.98]"
                  onClick={() => setCreateEventDialogOpen(true)}
                >
                  <Plus className="h-5 w-5 shrink-0" />
                  <div className="text-left">
                    <span className="text-sm font-medium block">{t('home.organizeEvent')}</span>
                    <span className="text-[11px] text-primary-foreground/70 block">{t('home.organizeEventSubtitle')}</span>
                  </div>
                </Button>
              </div>
              
              {/* Team row */}
              <div 
                onClick={() => navigate("/teams?filter=discover")}
                className="rounded-xl bg-card border border-border h-11 px-4 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <span className="flex-1 text-sm font-medium">{t('home.joinTeam')}</span>
                <ChevronRight className="h-4 w-4 text-muted" />
              </div>
            </div>
          </AnimatedCard>

          {/* Games Section - Clear Separation */}
          <AnimatedCard delay={0.25}>
            <div data-walkthrough="home-games" className="space-y-3">
              {/* Games to Join */}
              {!gamesLoading && topAvailableGames.length > 0 && (
                <Card className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-muted">
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <h2 className="text-[13px] font-semibold text-muted-foreground">
                        {t('matching:gamesToJoin')}
                      </h2>
                      <Badge variant="secondary" className="text-[10px] border-0">
                        {topAvailableGames.length}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-[11px] text-muted-foreground"
                      onClick={() => navigate("/events?tab=discover")}
                    >
                      {t('actions.viewAll')}
                      <ChevronRight className="h-3 w-3 ml-0.5" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {topAvailableGames.map((game) => (
                      <AvailableGameCard 
                        key={game.id} 
                        game={game} 
                        compact
                        showJoinBadge
                      />
                    ))}
                  </div>
                </Card>
              )}
              
              {/* Active Availability Status */}
              {availability && (
                <Card className="p-3 bg-primary/5 border-primary/20">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-primary" />
                    <div className="flex-1">
                      <span className="text-sm font-medium">{t('home.lookingFor', { sport: availability.sport })}</span>
                      <p className="text-[11px] text-muted-foreground">
                        {availability.location_district || availability.location || t('home.anyLocation')}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Match Proposals */}
              {!proposalsLoading && matchProposals.length > 0 && (
                <div className="space-y-2">
                  {matchProposals.map((proposal) => (
                    <MatchProposalInlineCard
                      key={proposal.id}
                      proposalId={proposal.id}
                      onAccepted={refetchProposals}
                      onDeclined={refetchProposals}
                    />
                  ))}
                </div>
              )}
              
              {/* Your Upcoming Events */}
              {eventsLoading ? (
                <Card className="p-3">
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
                    ))}
                  </div>
                </Card>
              ) : upcomingEvents.length > 0 ? (
                <Card className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-muted">
                        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <h2 className="text-section font-semibold">{t('matching:yourUpcomingEvents')}</h2>
                      <Badge variant="secondary" className="text-[10px]">
                        {userEvents.length}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-[11px] text-muted-foreground"
                      onClick={() => navigate("/events?tab=my")}
                    >
                      {t('actions.viewAll')}
                      <ChevronRight className="h-3 w-3 ml-0.5" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {upcomingEvents.map((match) => {
                      const matchDate = new Date(match.start_time);
                      const dateLabel = isToday(matchDate) ? t('time.today') : isTomorrow(matchDate) ? t('time.tomorrow') : null;
                      
                      return (
                        <div 
                          key={match.id}
                          onClick={() => navigate(`/events/${match.id}`)}
                          className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted cursor-pointer transition-colors active:scale-[0.99]"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-lg">
                            {getEventTypeEmoji(match.type, match.sport)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm line-clamp-2">{match.title}</p>
                              {dateLabel && (
                                <Badge 
                                  variant="secondary" 
                                  className={`text-[9px] px-1.5 py-0 shrink-0 ${
                                    isToday(matchDate) 
                                   ? 'bg-primary/15 text-primary' 
                                      : 'bg-primary/15 text-primary'
                                  }`}
                                >
                                  {dateLabel.toUpperCase()}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatDateTimeShort(match.start_time)}
                            </p>
                          </div>
                          {(() => {
                            const status = match.userStatus;
                            const chipConfig = status === 'attending'
                              ? { label: t('events:rsvp.going', 'Going'), bg: 'rgba(52,211,153,0.12)', color: '#34D399' }
                              : status === 'maybe'
                              ? { label: t('events:rsvp.maybe', 'Maybe'), bg: 'rgba(203,213,225,0.10)', color: '#CBD5E1' }
                              : status === 'not_attending'
                              ? { label: t('events:rsvp.cantGo', "Can't Go"), bg: 'rgba(248,113,113,0.12)', color: '#F87171' }
                              : null;
                            return chipConfig ? (
                              <span
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap"
                                style={{ backgroundColor: chipConfig.bg, color: chipConfig.color }}
                              >
                                {chipConfig.label}
                              </span>
                            ) : null;
                          })()}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ) : !gamesLoading && topAvailableGames.length === 0 && !availability ? (
                <Card className="p-6 text-center">
                  <span className="text-4xl mb-2 block">📅</span>
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                    <CalendarCheck className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-base font-semibold mb-1">{t('home.noUpcomingGames')}</p>
                  <p className="text-xs text-muted-foreground mb-3">{t('home.noUpcomingGamesDesc')}</p>
                  <Button onClick={() => setCreateEventDialogOpen(true)} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    {t('home.organizeEvent')}
                  </Button>
                </Card>
              ) : null}
            </div>
          </AnimatedCard>

          {/* Activity Feed */}
          <motion.div 
            data-walkthrough="home-feed"
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-section font-semibold">{t('activity.recentActivity')}</h2>
            </div>

            {feedLoading ? (
              <FeedSkeleton />
            ) : activities.length > 0 ? (
              <div className="space-y-2">
                {activities.map((activity, index) => (
                  <AnimatedCard key={activity.id} delay={0.35 + index * 0.05} hover={false}>
                    <ActivityCard {...activity} />
                  </AnimatedCard>
                ))}
                {hasMore && (
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="h-10"
                    >
                      {loadingMore ? t('actions.loading') : t('actions.loadMore')}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Card className="p-6 text-center">
                <Users className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                <h3 className="text-sm font-semibold mb-1.5">{t('home.noActivities')}</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  {t('home.noActivitiesDesc')}
                </p>
                <Button onClick={() => navigate("/teams")} variant="outline" size="sm">
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

      <FeedbackForm
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
      />
    </PageContainer>
  );
};

export default Index;
