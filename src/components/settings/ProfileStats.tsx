import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, UserPlus, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileStatsProps {
  userId: string;
}

export const ProfileStats = ({ userId }: ProfileStatsProps) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    teams: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    try {
      const [followersRes, followingRes, teamsRes] = await Promise.all([
        supabase
          .from('followers')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', userId),
        supabase
          .from('followers')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', userId),
        supabase
          .from('team_members')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'active'),
      ]);

      setStats({
        followers: followersRes.count || 0,
        following: followingRes.count || 0,
        teams: teamsRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-6 justify-center py-4 animate-pulse">
        <div className="h-5 w-24 bg-muted rounded"></div>
        <div className="h-5 w-24 bg-muted rounded"></div>
        <div className="h-5 w-24 bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 justify-center py-4 text-sm border-y border-border">
      <button
        onClick={() => navigate("/community")}
        className="flex items-center gap-2 hover:text-primary transition-colors"
      >
        <Users className="h-4 w-4" />
        <span className="font-semibold">{stats.followers}</span>
        <span className="text-muted-foreground">Followers</span>
      </button>
      <button
        onClick={() => navigate("/community")}
        className="flex items-center gap-2 hover:text-primary transition-colors"
      >
        <UserPlus className="h-4 w-4" />
        <span className="font-semibold">{stats.following}</span>
        <span className="text-muted-foreground">Following</span>
      </button>
      <button
        onClick={() => navigate("/teams")}
        className="flex items-center gap-2 hover:text-primary transition-colors"
      >
        <Trophy className="h-4 w-4" />
        <span className="font-semibold">{stats.teams}</span>
        <span className="text-muted-foreground">Teams</span>
      </button>
    </div>
  );
};
