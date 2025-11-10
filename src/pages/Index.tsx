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

      setStats({
        teams: teamsCount || 0,
        activities: Math.floor(Math.random() * 20) + 5, // Mock for now
        followers: followersCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
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
      <div className="space-y-6 animate-fade-in">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-primary-dark text-primary-foreground">
                {profile.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">
                Welcome back, {profile.display_name || profile.username}!
              </h1>
              <p className="text-sm text-muted-foreground">Ready to conquer today?</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4 text-center hover-scale cursor-pointer transition-all" onClick={() => navigate("/teams")}>
              <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-primary">{stats.teams}</p>
              <p className="text-xs text-muted-foreground">Teams</p>
            </Card>
            <Card className="p-4 text-center hover-scale cursor-pointer transition-all">
              <Activity className="h-5 w-5 mx-auto mb-2 text-accent" />
              <p className="text-2xl font-bold text-accent">{stats.activities}</p>
              <p className="text-xs text-muted-foreground">Activities</p>
            </Card>
            <Card className="p-4 text-center hover-scale cursor-pointer transition-all" onClick={() => navigate("/users")}>
              <TrendingUp className="h-5 w-5 mx-auto mb-2 text-teal" />
              <p className="text-2xl font-bold text-teal">{stats.followers}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </Card>
          </div>

          {/* Primary CTA */}
          <Button 
            size="lg" 
            className="w-full bg-gradient-to-r from-primary to-primary-dark hover:opacity-90 transition-all active:scale-[0.98]"
            onClick={() => navigate("/track")}
          >
            <Trophy className="mr-2 h-5 w-5" />
            Log Activity
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <QuickActions />
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Activity Feed</h2>
            <Button variant="ghost" size="sm" className="text-primary">
              View All
            </Button>
          </div>

          {feedLoading ? (
            <FeedSkeleton />
          ) : activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <ActivityCard key={activity.id} {...activity} />
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
        </div>
      </div>
    </PageContainer>
  );
};

export default Index;
