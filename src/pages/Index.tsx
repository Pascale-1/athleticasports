import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@supabase/supabase-js";
import { Trophy, Users, TrendingUp, Swords, UserPlus, Search, Sparkles, Plus, CalendarCheck, ChevronRight, CheckCircle2 } from "lucide-react";
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
// Match proposals now integrated into available games - removed redundant section
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
          {/* Hero Section with Merged Stats */}
          <AnimatedCard delay={0.1}>
            <Card data-walkthrough="profile" className="p-3 space-y-2.5 relative">
              {/* Language Toggle & Logout */}
              <div className="absolute top-2 right-2 flex items-center gap-1">
                <LanguageToggle />
                <LogoutButton variant="header" />
              </div>
              
              <div className="flex items-center gap-2.5">
                <Avatar size="lg" ring="coral">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-base bg-primary/10 text-primary">
                    {profile.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h1 className="text-sm font-heading font-bold break-words max-w-full">
                    {t('home.welcome', { name: profile.display_name || profile.username })}
                  </h1>
                  <p className="text-xs text-muted-foreground">{t('home.readyToPlay')}</p>
                </div>
              </div>

              {/* Compact Stats Row */}
              <div className="flex items-center justify-around border-t pt-2.5">
                <button 
                  onClick={() => navigate("/teams?filter=my-teams")}
                  className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all hover:bg-muted active:scale-95 min-h-[40px] min-w-[40px]"
                >
                  <Users className="h-4 w-4 text-primary" />
                  <p className="text-xs font-bold">{stats.teams}</p>
                  <p className="text-[10px] text-muted-foreground">{t('home.teams')}</p>
                </button>
                <button
                  onClick={() => navigate("/events?type=match")}
                  className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all hover:bg-muted active:scale-95 min-h-[40px] min-w-[40px]"
                >
                  <Swords className="h-4 w-4 text-primary" />
                  <p className="text-xs font-bold">{stats.upcomingMatches}</p>
                  <p className="text-[10px] text-muted-foreground">{t('home.games')}</p>
                </button>
                <button
                  onClick={() => navigate("/settings")}
                  className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all hover:bg-muted active:scale-95 min-h-[40px] min-w-[40px]"
                >
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <p className="text-xs font-bold">{stats.followers}</p>
                  <p className="text-[10px] text-muted-foreground">{t('home.followers')}</p>
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
                className="flex flex-col items-center justify-center gap-1.5 h-14 px-2 bg-green-600 hover:bg-green-700 overflow-hidden"
                onClick={() => setFindMatchSheetOpen(true)}
              >
                <CalendarCheck className="h-4 w-4 flex-shrink-0" />
                <span className="text-[11px] font-medium text-center truncate max-w-full">{t('home.findGame')}</span>
              </Button>
              
              <Button 
                variant="outline"
                className="flex flex-col items-center justify-center gap-1.5 h-14 px-2 overflow-hidden"
                onClick={() => setCreateEventDialogOpen(true)}
              >
                <Plus className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-[11px] font-medium text-center truncate max-w-full">{t('home.organizeEvent')}</span>
              </Button>
              
              <Button 
                type="button"
                variant="outline"
                className="flex flex-col items-center justify-center gap-1.5 h-14 px-2 overflow-hidden"
                onClick={() => navigate("/teams/create")}
              >
                <Users className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-[11px] font-medium text-center truncate max-w-full">{t('home.createTeam')}</span>
              </Button>
            </div>
          </AnimatedCard>

          {/* Unified Games Section - Combines open games + your matches */}
          <AnimatedCard delay={0.25}>
            <Card data-walkthrough="games" className="p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Swords className="h-4 w-4 text-primary" />
                  <h2 className="text-xs font-heading font-semibold">{t('common:home.games')}</h2>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary min-h-[36px] text-xs"
                  onClick={() => navigate("/events?type=match")}
                >
                  {t('common:actions.viewAll')}
                </Button>
              </div>
              
              {/* Active Availability Status */}
              {availability && (
                <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Search className="h-3.5 w-3.5 text-primary" />
                    <span className="font-medium">{t('common:home.lookingFor', { sport: availability.sport })}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {availability.location_district || availability.location || t('common:home.anyLocation')}
                  </p>
                </div>
              )}
              
              {/* Open Games Looking for Players - with match quality indicators */}
              {!gamesLoading && topAvailableGames.length > 0 && (
                <div className="rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 space-y-1.5 border border-emerald-200/50 dark:border-emerald-800/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <UserPlus className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-medium">{t('matching:joinAGame')}</span>
                      <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-[10px]">
                        {topAvailableGames.length}
                      </Badge>
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-[10px] p-0 h-auto text-emerald-600 dark:text-emerald-400"
                      onClick={() => navigate("/events?tab=open")}
                    >
                      {t('matching:viewAll')}
                    </Button>
                  </div>
                  {topAvailableGames.map((game) => (
                    <AvailableGameCard 
                      key={game.id} 
                      game={game} 
                      compact
                      showJoinBadge
                    />
                  ))}
                </div>
              )}
              
              {/* Your Upcoming Matches */}
              {matchesLoading ? (
                <div className="space-y-1.5">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : upcomingMatches.length > 0 ? (
                <div className="rounded-xl bg-slate-50/50 dark:bg-slate-900/20 p-2.5 space-y-1.5 border border-slate-200/50 dark:border-slate-700/30">
                  <div className="flex items-center gap-1.5">
                    <CalendarCheck className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                    <span className="text-xs font-medium">{t('matching:yourMatches')}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {upcomingMatches.length}
                    </Badge>
                  </div>
                  {upcomingMatches.map((match) => (
                    <div 
                      key={match.id}
                      onClick={() => navigate(`/events/${match.id}`)}
                      className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Trophy className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs truncate">{match.title}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatDateTimeShort(match.start_time)}
                        </p>
                      </div>
                      <CheckCircle2 className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              ) : !gamesLoading && topAvailableGames.length === 0 && !availability ? (
                <div className="text-center py-4">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
                    <CalendarCheck className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-xs mb-2">{t('common:home.noUpcomingGames')}</p>
                  <div className="flex gap-2 justify-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setFindMatchSheetOpen(true)}
                    >
                      <Search className="h-3.5 w-3.5 mr-1.5" />
                      {t('common:home.lookingToPlay')}
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => setCreateEventDialogOpen(true)}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      {t('common:home.createEvent')}
                    </Button>
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
