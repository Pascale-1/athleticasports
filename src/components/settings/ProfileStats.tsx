import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, CalendarCheck, Dumbbell, Medal } from "lucide-react";
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
    trainings: 0,
    wins: 0,
    winStreak: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    try {
      const [teamsRes, eventsRes, trainingsRes, winsRes] = await Promise.all([
        supabase
          .from('team_members')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'active'),
        supabase
          .from('event_attendance')
          .select('id, events!inner(start_time, type)', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'attending')
          .eq('events.type', 'match')
          .lt('events.start_time', new Date().toISOString()),
        supabase
          .from('event_attendance')
          .select('id, events!inner(start_time, type)', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'attending')
          .eq('events.type', 'training')
          .lt('events.start_time', new Date().toISOString()),
        // Get wins: events user attended that are match type with win outcome
        supabase
          .from('event_attendance' as any)
          .select('id, events!inner(start_time, type, match_outcome)')
          .eq('user_id', userId)
          .eq('status', 'attending')
          .eq('events.type', 'match')
          .eq('events.match_outcome', 'win'),
      ]);

      if (teamsRes.error) console.error('Error fetching team stats:', teamsRes.error);
      if (eventsRes.error) console.error('Error fetching event stats:', eventsRes.error);
      if (trainingsRes.error) console.error('Error fetching training stats:', trainingsRes.error);

      const winsCount = winsRes.error ? 0 : (winsRes.data?.length ?? 0);

      // Calculate win streak from recent matches
      let streak = 0;
      try {
        const { data: recentMatches } = await supabase
          .from('event_attendance' as any)
          .select('events!inner(start_time, type, match_outcome)')
          .eq('user_id', userId)
          .eq('status', 'attending')
          .eq('events.type', 'match')
          .not('events.match_outcome', 'is', null)
          .order('events(start_time)', { ascending: false })
          .limit(20);

        if (recentMatches) {
          for (const m of recentMatches) {
            if ((m as any).events?.match_outcome === 'win') streak++;
            else break;
          }
        }
      } catch {
        // streak remains 0
      }

      setStats({
        teams: teamsRes.error ? 0 : (teamsRes.count ?? 0),
        eventsAttended: eventsRes.error ? 0 : (eventsRes.count ?? 0),
        trainings: trainingsRes.error ? 0 : (trainingsRes.count ?? 0),
        wins: winsCount,
        winStreak: streak,
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
    { 
      icon: Dumbbell, 
      value: stats.trainings, 
      label: t('profile.trainingsLabel', 'Trainings'),
      onClick: () => navigate("/events?tab=my")
    },
    { 
      icon: Medal, 
      value: stats.wins, 
      label: t('profile.winsLabel', 'Wins'),
      onClick: () => navigate("/events?tab=my"),
      extra: stats.winStreak >= 2 ? `🔥${stats.winStreak}` : undefined,
    },
  ];

  if (loading) {
    return (
      <div className="flex gap-4 justify-center py-4 mt-4 border-t border-border animate-pulse">
        {[1, 2, 3, 4].map((i) => (
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
    <div className="flex justify-center gap-0 py-4 mt-4 border-t border-border">
      {statItems.map(({ icon: Icon, value, label, onClick, extra }, index) => (
        <button
          key={label}
          onClick={onClick}
          className={cn(
            "flex flex-col items-center gap-1.5 min-h-[72px] flex-1 px-3 py-3 rounded-xl transition-all duration-200",
            "hover:bg-muted/50 active:scale-95 cursor-pointer",
            index > 0 && "border-l border-muted"
          )}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-[24px] tabular-nums leading-tight">{value}</span>
            {extra && <span className="text-xs">{extra}</span>}
          </div>
          <span className="text-[10px] text-muted-foreground leading-tight uppercase tracking-[0.08em]">{label}</span>
        </button>
      ))}
    </div>
  );
};
