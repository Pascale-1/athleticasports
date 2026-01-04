import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@supabase/supabase-js";
import { Trophy, Users, TrendingUp, Swords, UserPlus, Search } from "lucide-react";
import { ActivityCard } from "@/components/feed/ActivityCard";
import { FeedSkeleton } from "@/components/feed/FeedSkeleton";
import { useActivityFeed } from "@/hooks/useActivityFeed";
import { PageContainer } from "@/components/mobile/PageContainer";
import { PullToRefresh } from "@/components/animations/PullToRefresh";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useEvents } from "@/hooks/useEvents";
import { CreateMatchSheet } from "@/components/matching/CreateMatchSheet";
import { FindMatchSheet } from "@/components/matching/FindMatchSheet";
import { MyMatchStatus } from "@/components/matching/MyMatchStatus";

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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats>({ teams: 0, upcomingMatches: 0, followers: 0 });
  const [loading, setLoading] = useState(true);
  const [createMatchSheetOpen, setCreateMatchSheetOpen] = useState(false);
  const [findMatchSheetOpen, setFindMatchSheetOpen] = useState(false);
  const { activities, loading: feedLoading, loadingMore, hasMore, loadMore } = useActivityFeed();
  
  // Fetch upcoming matches
  const { events: allMatches, loading: matchesLoading } = useEvents(undefined, { status: 'upcoming' });
  const upcomingMatches = allMatches.filter(e => e.type === 'match').slice(0, 3);

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
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </PageContainer>
    );
  }

  if (!profile) {
    return (
      <PageContainer>
        <Card className="max-w-md mx-auto p-6 text-center space-y-4">
          <Trophy className="h-12 w-12 mx-auto text-primary" />
          <h2 className="text-xl font-bold">Complete Your Profile</h2>
          <p className="text-muted-foreground text-sm">
            Set up your athlete profile to get started and connect with the community.
          </p>
          <Button onClick={() => navigate("/settings")} className="w-full">
            Create Profile
          </Button>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PullToRefresh onRefresh={handleRefresh}>
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Hero Section with Merged Stats */}
          <AnimatedCard delay={0.1}>
            <Card className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar size="xl" ring="coral">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-heading-3 bg-primary/10 text-primary">
                    {profile.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h1 className="text-heading-2 font-bold break-words max-w-full">
                    Welcome back, {profile.display_name || profile.username}!
                  </h1>
                  <p className="text-body text-muted-foreground">Ready to find your next match?</p>
                </div>
              </div>

              {/* Compact Stats Row */}
              <div className="flex items-center justify-around border-t pt-3">
                <button 
                  onClick={() => navigate("/teams?filter=my-teams")}
                  className="flex flex-col items-center gap-1 transition-all hover:text-primary active:scale-95 min-h-[44px] min-w-[44px]"
                >
                  <Users className="h-4 w-4 text-primary" />
                  <p className="text-body-large font-bold">{stats.teams}</p>
                  <p className="text-caption text-muted-foreground">Teams</p>
                </button>
                <div className="h-12 w-px bg-border" />
                <button
                  onClick={() => navigate("/events?type=match")}
                  className="flex flex-col items-center gap-1 transition-all hover:text-primary active:scale-95 min-h-[44px] min-w-[44px]"
                >
                  <Swords className="h-4 w-4 text-primary" />
                  <p className="text-body-large font-bold">{stats.upcomingMatches}</p>
                  <p className="text-caption text-muted-foreground">Matches</p>
                </button>
                <div className="h-12 w-px bg-border" />
                <button
                  onClick={() => navigate("/settings")}
                  className="flex flex-col items-center gap-1 transition-all hover:text-primary active:scale-95 min-h-[44px] min-w-[44px]"
                >
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <p className="text-body-large font-bold">{stats.followers}</p>
                  <p className="text-caption text-muted-foreground">Followers</p>
                </button>
              </div>
            </Card>
          </AnimatedCard>

          {/* Quick Actions - Match Focused */}
          <AnimatedCard delay={0.2}>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant="default"
                className="flex flex-col items-center justify-center gap-2 h-auto py-4 px-2"
                onClick={() => setCreateMatchSheetOpen(true)}
              >
                <Swords className="h-5 w-5" />
                <span className="text-xs font-medium text-center">Create Match</span>
              </Button>
              
              <Button 
                type="button"
                variant="outline"
                className="flex flex-col items-center justify-center gap-2 h-auto py-4 px-2"
                onClick={() => navigate("/teams/create")}
              >
                <Users className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium text-center">Create Team</span>
              </Button>
              
              <Button 
                variant="outline"
                className="flex flex-col items-center justify-center gap-2 h-auto py-4 px-2"
                onClick={() => setFindMatchSheetOpen(true)}
              >
                <Search className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium text-center">Find Match</span>
              </Button>
            </div>
          </AnimatedCard>

          {/* Match Status Section */}
          <AnimatedCard delay={0.25}>
            <MyMatchStatus onFindMatchClick={() => setFindMatchSheetOpen(true)} />
          </AnimatedCard>

          {/* Upcoming Matches Section */}
          <AnimatedCard delay={0.25}>
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Swords className="h-5 w-5 text-primary" />
                  <h2 className="text-heading-3 font-semibold">Upcoming Matches</h2>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary min-h-[44px]"
                  onClick={() => navigate("/events?type=match")}
                >
                  View All
                </Button>
              </div>
              
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
                          {new Date(match.start_time).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {match.max_participants && (
                        <Badge variant="secondary" className="flex-shrink-0">
                          <UserPlus className="h-3 w-3 mr-1" />
                          Open
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Swords className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-3">No upcoming matches</p>
                  <Button 
                    size="sm"
                    onClick={() => setCreateMatchSheetOpen(true)}
                  >
                    Create a Match
                  </Button>
                </div>
              )}
            </Card>
          </AnimatedCard>

          {/* Activity Feed */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-heading-3 font-semibold">Activity Feed</h2>
              <Button variant="ghost" size="sm" className="text-primary min-h-[44px]">
                View All
              </Button>
            </div>

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
                      {loadingMore ? "Loading..." : "Load More"}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No Activities Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start following athletes or join teams to see their activities here.
                </p>
                <Button onClick={() => navigate("/teams")} variant="outline">
                  Browse Teams
                </Button>
              </Card>
            )}
          </motion.div>
        </motion.div>
      </PullToRefresh>

      <CreateMatchSheet
        open={createMatchSheetOpen}
        onOpenChange={setCreateMatchSheetOpen}
      />
      
      <FindMatchSheet
        open={findMatchSheetOpen}
        onOpenChange={setFindMatchSheetOpen}
      />
    </PageContainer>
  );
};

export default Index;
