import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@supabase/supabase-js";
import { Trophy, Users, TrendingUp, Swords, UserPlus, Search, Sparkles, Plus, CalendarCheck, ChevronRight, CheckCircle2, Camera } from "lucide-react";
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
import { useAppWalkthrough } from "@/hooks/useAppWalkthrough";
import { useAvailableGames } from "@/hooks/useAvailableGames";
import { AvailableGameCard } from "@/components/matching/AvailableGameCard";
import { isToday, isTomorrow } from "date-fns";

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
  const { t } = useTranslation(['common', 'matching']);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats>({ teams: 0, upcomingMatches: 0, followers: 0 });
  const [loading, setLoading] = useState(true);
  const [createEventDialogOpen, setCreateEventDialogOpen] = useState(false);
  const [findMatchSheetOpen, setFindMatchSheetOpen] = useState(false);
  const { activities, loading: feedLoading, loadingMore, hasMore, loadMore } = useActivityFeed();
  
  // Fetch user's matches (where they are attending or maybe)
  const { events: userMatches, loading: matchesLoading } = useUserEvents({ 
    type: 'match', 
    status: 'upcoming' 
  });
  const upcomingMatches = userMatches.slice(0, 3);
  
  // Fetch available games (looking for players)
  const { games: availableGames, loading: gamesLoading } = useAvailableGames();
  const topAvailableGames = availableGames.slice(0, 3);
  
  // Fetch match status (proposals & availability)
  const { availability } = usePlayerAvailability();
  
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
          className="space-y-4 pb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Hero Section - Clean & Compact */}
          <AnimatedCard delay={0.1}>
            <Card data-walkthrough="profile" className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                {/* Avatar with camera overlay */}
                <div className="relative group">
                  <Avatar className="h-14 w-14 border-2 border-primary/20">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="text-lg bg-primary/10 text-primary font-bold">
                      {profile.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <button 
                    onClick={() => navigate("/settings")}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera className="h-4 w-4 text-white" />
                  </button>
                </div>
                
                {/* Greeting */}
                <div className="flex-1 min-w-0 pt-1">
                  <h1 className="text-section font-heading font-bold truncate">
                    {t('home.welcome', { name: profile.display_name || profile.username })}
                  </h1>
                  <p className="text-caption text-muted-foreground">{t('home.readyToPlay')}</p>
                </div>
              </div>

              {/* Stats Row - Larger touch targets */}
              <div className="flex items-center justify-around border-t border-border/50 pt-3 -mx-1">
                <button 
                  onClick={() => navigate("/teams?filter=my-teams")}
                  className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all hover:bg-muted active:scale-95 min-h-[56px]"
                >
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-base font-bold">{stats.teams}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{t('home.teams')}</span>
                </button>
                
                <div className="w-px h-8 bg-border/50" />
                
                <button
                  onClick={() => navigate("/events?type=match")}
                  className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all hover:bg-muted active:scale-95 min-h-[56px]"
                >
                  <div className="flex items-center gap-1.5">
                    <Swords className="h-4 w-4 text-primary" />
                    <span className="text-base font-bold">{stats.upcomingMatches}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{t('home.games')}</span>
                </button>
                
                <div className="w-px h-8 bg-border/50" />
                
                <button
                  onClick={() => navigate("/settings")}
                  className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all hover:bg-muted active:scale-95 min-h-[56px]"
                >
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-base font-bold">{stats.followers}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{t('home.followers')}</span>
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

          {/* Quick Actions - 2x2 Grid Primary + Secondary */}
          <AnimatedCard delay={0.2}>
            <div data-walkthrough="quick-actions" className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="default"
                  className="flex flex-col items-center justify-center gap-1.5 h-16 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]"
                  onClick={() => setFindMatchSheetOpen(true)}
                >
                  <Search className="h-5 w-5" />
                  <span className="text-xs font-medium leading-tight text-center">{t('home.findGame')}</span>
                </Button>
                
                <Button 
                  variant="default"
                  className="flex flex-col items-center justify-center gap-1.5 h-16 active:scale-[0.98]"
                  onClick={() => setCreateEventDialogOpen(true)}
                >
                  <Plus className="h-5 w-5" />
                  <span className="text-xs font-medium leading-tight text-center">{t('home.organizeEvent')}</span>
                </Button>
              </div>
              
              <Button 
                variant="outline"
                className="w-full h-10 text-xs active:scale-[0.98]"
                onClick={() => navigate("/teams/create")}
              >
                <Users className="h-4 w-4 mr-2" />
                {t('home.createTeam')}
              </Button>
            </div>
          </AnimatedCard>

          {/* Games Section - Clear Separation */}
          <AnimatedCard delay={0.25}>
            <div data-walkthrough="games" className="space-y-3">
              {/* Games to Join */}
              {!gamesLoading && topAvailableGames.length > 0 && (
                <Card className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                        <UserPlus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h2 className="text-section font-semibold text-emerald-700 dark:text-emerald-300">
                        {t('matching:gamesToJoin')}
                      </h2>
                      <Badge className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-[10px] border-0">
                        {topAvailableGames.length}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-[11px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-100/50"
                      onClick={() => navigate("/events?tab=open")}
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
              
              {/* Your Upcoming Games */}
              {matchesLoading ? (
                <Card className="p-3">
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
                    ))}
                  </div>
                </Card>
              ) : upcomingMatches.length > 0 ? (
                <Card className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-muted">
                        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <h2 className="text-section font-semibold">{t('matching:yourUpcomingGames')}</h2>
                      <Badge variant="secondary" className="text-[10px]">
                        {upcomingMatches.length}
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
                    {upcomingMatches.map((match) => {
                      const matchDate = new Date(match.start_time);
                      const dateLabel = isToday(matchDate) ? t('time.today') : isTomorrow(matchDate) ? t('time.tomorrow') : null;
                      
                      return (
                        <div 
                          key={match.id}
                          onClick={() => navigate(`/events/${match.id}`)}
                          className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted cursor-pointer transition-colors active:scale-[0.99]"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Trophy className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">{match.title}</p>
                              {dateLabel && (
                                <Badge 
                                  variant="secondary" 
                                  className={`text-[9px] px-1.5 py-0 shrink-0 ${
                                    isToday(matchDate) 
                                      ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' 
                                      : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
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
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ) : !gamesLoading && topAvailableGames.length === 0 && !availability ? (
                <Card className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                    <CalendarCheck className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">{t('home.noUpcomingGames')}</p>
                  <div className="flex gap-2 justify-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-10"
                      onClick={() => setFindMatchSheetOpen(true)}
                    >
                      <Search className="h-4 w-4 mr-1.5" />
                      {t('home.lookingToPlay')}
                    </Button>
                    <Button 
                      size="sm"
                      className="h-10"
                      onClick={() => setCreateEventDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-1.5" />
                      {t('home.createEvent')}
                    </Button>
                  </div>
                </Card>
              ) : null}
            </div>
          </AnimatedCard>

          {/* Activity Feed */}
          <motion.div 
            data-walkthrough="feed"
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
                {activities.slice(0, 5).map((activity, index) => (
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
    </PageContainer>
  );
};

export default Index;
