import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Users, UserPlus, Trophy, CalendarCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileStatsProps {
  userId: string;
}

export const ProfileStats = ({ userId }: ProfileStatsProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    teams: 0,
    eventsAttended: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    try {
      const [followersRes, followingRes, teamsRes, eventsRes] = await Promise.all([
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
        supabase
          .from('event_attendance')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'attending'),
      ]);

      setStats({
        followers: followersRes.count || 0,
        following: followingRes.count || 0,
        teams: teamsRes.count || 0,
        eventsAttended: eventsRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-4 justify-center py-4 animate-pulse">
        <div className="h-5 w-20 bg-muted rounded"></div>
        <div className="h-5 w-20 bg-muted rounded"></div>
        <div className="h-5 w-20 bg-muted rounded"></div>
        <div className="h-5 w-20 bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 justify-center py-4 text-sm border-y border-border">
      <div className="flex items-center gap-1.5 min-h-[44px] px-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="font-semibold">{stats.followers}</span>
        <span className="text-muted-foreground text-xs">{t('profile.followers')}</span>
      </div>
      <div className="flex items-center gap-1.5 min-h-[44px] px-2">
        <UserPlus className="h-4 w-4 text-muted-foreground" />
        <span className="font-semibold">{stats.following}</span>
        <span className="text-muted-foreground text-xs">{t('profile.following')}</span>
      </div>
      <button
        onClick={() => navigate("/teams?filter=my-teams")}
        className="flex items-center gap-1.5 hover:text-primary transition-colors min-h-[44px] px-2"
      >
        <Trophy className="h-4 w-4 text-muted-foreground" />
        <span className="font-semibold">{stats.teams}</span>
        <span className="text-muted-foreground text-xs">{t('profile.teamsLabel')}</span>
      </button>
      <button
        onClick={() => navigate("/events?tab=my")}
        className="flex items-center gap-1.5 hover:text-primary transition-colors min-h-[44px] px-2"
      >
        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
        <span className="font-semibold">{stats.eventsAttended}</span>
        <span className="text-muted-foreground text-xs">{t('profile.eventsLabel')}</span>
      </button>
    </div>
  );
};
