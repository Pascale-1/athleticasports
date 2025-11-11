import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@supabase/supabase-js";
import { Trophy, Users, Activity, TrendingUp } from "lucide-react";
import { ActivityCard } from "@/components/feed/ActivityCard";
import { FeedSkeleton } from "@/components/feed/FeedSkeleton";
import { QuickActions } from "@/components/feed/QuickActions";
import { useActivityFeed } from "@/hooks/useActivityFeed";
import { PageContainer } from "@/components/mobile/PageContainer";
import { PullToRefresh } from "@/components/animations/PullToRefresh";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { motion } from "framer-motion";

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
  activities: number;
  followers: number;
}

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats>({ teams: 0, activities: 0, followers: 0 });
  const [loading, setLoading] = useState(true);
  const { activities, loading: feedLoading } = useActivityFeed();

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
        // Fetch user stats
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
      // Fetch teams count
      const { count: teamsCount } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Fetch followers count
      const { count: followersCount } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      // Fetch activities count
      const { count: activitiesCount } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      setStats({
        teams: teamsCount || 0,
        activities: activitiesCount || 0,
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
          {/* Hero Section */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {profile.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h1 className="heading-2 break-words max-w-full">
                  Welcome back, {profile.display_name || profile.username}!
                </h1>
                <p className="body-small text-subtle">Ready to conquer today?</p>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <AnimatedCard delay={0.2} onClick={() => navigate("/teams")}>
                <Card className="p-4 text-center cursor-pointer transition-all hover-lift">
                  <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold font-heading text-primary">{stats.teams}</p>
                  <p className="body-small text-subtle">Teams</p>
                </Card>
              </AnimatedCard>
              <AnimatedCard delay={0.25}>
                <Card className="p-4 text-center cursor-pointer transition-all hover-lift">
                  <Activity className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold font-heading text-primary">{stats.activities}</p>
                  <p className="body-small text-subtle">Activities</p>
                </Card>
              </AnimatedCard>
              <AnimatedCard delay={0.3} onClick={() => navigate("/users")}>
                <Card className="p-4 text-center cursor-pointer transition-all hover-lift">
                  <TrendingUp className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold font-heading text-primary">{stats.followers}</p>
                  <p className="body-small text-subtle">Followers</p>
                </Card>
              </AnimatedCard>
            </div>

            {/* Primary CTA */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 }}
            >
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => navigate("/track")}
              >
                <Trophy className="mr-2 h-5 w-5" />
                Log Activity
              </Button>
            </motion.div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="heading-3">Quick Actions</h2>
            <QuickActions />
          </motion.div>

          {/* Activity Feed */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="heading-3">Activity Feed</h2>
              <Button variant="ghost" size="sm" className="text-primary">
                View All
              </Button>
            </div>

            {feedLoading ? (
              <FeedSkeleton />
            ) : activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <AnimatedCard key={activity.id} delay={0.6 + index * 0.05} hover={false}>
                    <ActivityCard {...activity} />
                  </AnimatedCard>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Activity className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No Activities Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start following athletes or join teams to see their activities here.
                </p>
                <Button onClick={() => navigate("/users")} variant="outline">
                  Find Athletes
                </Button>
              </Card>
            )}
          </motion.div>
        </motion.div>
      </PullToRefresh>
    </PageContainer>
  );
};

export default Index;
