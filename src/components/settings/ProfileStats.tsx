import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, CalendarCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ProfileStatsProps {
  userId: string;
}

export const ProfileStats = ({ userId }: ProfileStatsProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const [stats, setStats] = useState({
    teams: 0,
    eventsAttended: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    try {
      const [teamsRes, eventsRes] = await Promise.all([
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
      <div className="flex gap-4 justify-center py-4 mt-4 border-t border-border animate-pulse">
        {[1, 2].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="h-10 w-10 bg-muted rounded-full" />
            <div className="h-5 w-8 bg-muted rounded" />
            <div className="h-3 w-12 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-8 py-4 mt-4 border-t border-border">
      {statItems.map(({ icon: Icon, value, label, onClick }) => (
        <button
          key={label}
          onClick={onClick}
          className={cn(
            "flex flex-col items-center gap-1.5 min-h-[72px] min-w-[80px] px-4 py-3 rounded-xl transition-all duration-200",
            "hover:bg-muted/80 active:scale-95 cursor-pointer"
          )}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-lg tabular-nums">{value}</span>
          <span className="text-xs text-muted-foreground leading-tight">{label}</span>
        </button>
      ))}
    </div>
  );
};
