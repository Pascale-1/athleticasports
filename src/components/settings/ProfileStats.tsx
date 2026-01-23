import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Users, UserPlus, Trophy, CalendarCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

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

  const statItems = [
    { 
      icon: Users, 
      value: stats.followers, 
      label: t('profile.followers'),
      onClick: undefined
    },
    { 
      icon: UserPlus, 
      value: stats.following, 
      label: t('profile.following'),
      onClick: undefined
    },
    { 
      icon: Trophy, 
      value: stats.teams, 
      label: t('profile.teamsLabel'),
      onClick: () => navigate("/teams?filter=my-teams")
    },
    { 
      icon: CalendarCheck, 
      value: stats.eventsAttended, 
      label: t('profile.eventsLabel'),
      onClick: () => navigate("/events?tab=my")
    },
  ];

  if (loading) {
    return (
      <div className="flex gap-2 justify-around py-4 mt-4 border-t border-border animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="h-5 w-8 bg-muted rounded" />
            <div className="h-3 w-12 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex justify-around py-4 mt-4 border-t border-border">
      {statItems.map(({ icon: Icon, value, label, onClick }) => (
        <button
          key={label}
          onClick={onClick}
          disabled={!onClick}
          className={cn(
            "flex flex-col items-center gap-1 min-h-[52px] min-w-[60px] px-3 py-2 rounded-xl transition-all duration-200",
            onClick && "hover:bg-muted/80 active:scale-95 cursor-pointer",
            !onClick && "cursor-default"
          )}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/60">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <span className="font-bold text-base tabular-nums">{value}</span>
          <span className="text-[10px] text-muted-foreground leading-tight">{label}</span>
        </button>
      ))}
    </div>
  );
};
