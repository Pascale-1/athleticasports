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
                  <p className="text-body text-muted-foreground">Ready to conquer today?</p>
                </div>
              </div>

              {/* Compact Stats Row */}
              <div className="flex items-center justify-around border-t pt-3">
                <button 
                  onClick={() => navigate("/teams")}
                  className="flex flex-col items-center gap-1 transition-all hover:text-primary active:scale-95 min-h-[44px] min-w-[44px]"
                >
                  <Users className="h-4 w-4 text-primary" />
                  <p className="text-body-large font-bold">{stats.teams}</p>
                  <p className="text-caption text-muted-foreground">Teams</p>
                </button>
                <div className="h-12 w-px bg-border" />
                <div className="flex flex-col items-center gap-1">
                  <Activity className="h-4 w-4 text-primary" />
                  <p className="text-body-large font-bold">{stats.activities}</p>
                  <p className="text-caption text-muted-foreground">Activities</p>
                </div>
                <div className="h-12 w-px bg-border" />
                <button
                  onClick={() => navigate("/users")}
                  className="flex flex-col items-center gap-1 transition-all hover:text-primary active:scale-95 min-h-[44px] min-w-[44px]"
                >
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <p className="text-body-large font-bold">{stats.followers}</p>
                  <p className="text-caption text-muted-foreground">Followers</p>
                </button>
              </div>
            </Card>
          </AnimatedCard>

          {/* Primary CTA */}
          <AnimatedCard delay={0.2}>
            <Button 
              size="lg" 
              className="w-full"
              onClick={() => navigate("/track")}
            >
              <Trophy className="mr-2 h-5 w-5" />
              Log Activity
            </Button>
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
