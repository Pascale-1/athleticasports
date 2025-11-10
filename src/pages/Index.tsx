import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@supabase/supabase-js";
import { Trophy, Users } from "lucide-react";
import { FollowerStats } from "@/components/FollowerStats";

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  full_name: string | null;
  primary_sport: string | null;
  team_name: string | null;
}

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to Athletica Sports</h1>
        <p className="text-muted-foreground">Your sports community platform</p>
      </div>

      {profile ? (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl">
                    {profile.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-2xl">@{profile.username}</CardTitle>
              {profile.display_name && (
                <CardDescription className="text-lg font-medium">{profile.display_name}</CardDescription>
              )}
              <FollowerStats userId={profile.user_id} />
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.bio && (
                <p className="text-center text-muted-foreground">{profile.bio}</p>
              )}
              
              {(profile.primary_sport || profile.team_name) && (
                <div className="flex flex-wrap justify-center gap-4 py-2">
                  {profile.primary_sport && (
                    <div className="flex items-center gap-2 text-sm">
                      <Trophy className="h-4 w-4 text-primary" />
                      <span className="font-medium">{profile.primary_sport}</span>
                    </div>
                  )}
                  {profile.team_name && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-medium">{profile.team_name}</span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button onClick={() => navigate("/settings")} variant="outline" className="flex-1">
                    Edit Profile
                  </Button>
                  <Button onClick={handleSignOut} variant="outline" className="flex-1">
                    Sign Out
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>
                Set up your athlete profile to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                You haven't set up your profile yet. Click below to add your information and join the community.
              </p>
              <div className="flex gap-2">
                <Button onClick={() => navigate("/settings")} className="flex-1">
                  Create Profile
                </Button>
                <Button onClick={handleSignOut} variant="outline" className="flex-1">
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Index;
