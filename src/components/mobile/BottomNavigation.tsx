import { Home, Users, Calendar, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSubscription } from "@/lib/realtimeManager";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

export const BottomNavigation = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const [pendingInvites, setPendingInvites] = useState(0);
  const [todayEvents, setTodayEvents] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch notification badges
  const fetchBadges = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    // Get pending team invitations - match by user_id OR email
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, email')
      .eq('user_id', user.id)
      .single();

    if (profile) {
      const { count: inviteCount } = await supabase
        .from('team_invitations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .or(`invited_user_id.eq.${user.id},email.eq.${profile.username},email.eq.${profile.email || ''}`);

      setPendingInvites(inviteCount || 0);
    }

    // Get upcoming events where user has NO attendance record (unanswered RSVP)
    const now = new Date().toISOString();

    // First get events user is part of (via team membership or public) that are upcoming
    // and where user has NO attendance record at all
    const { data: userTeamIds } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id)
      .eq('status', 'active');

    const teamIds = userTeamIds?.map(t => t.team_id) || [];

    // Get upcoming events for user's teams that user hasn't responded to
    let unansweredCount = 0;

    if (teamIds.length > 0) {
      // Get upcoming team events
      const { data: teamEvents } = await supabase
        .from('events')
        .select('id')
        .in('team_id', teamIds)
        .gte('start_time', now)
        .limit(50);

      if (teamEvents && teamEvents.length > 0) {
        const eventIds = teamEvents.map(e => e.id);
        
        // Get events user HAS responded to
        const { data: responded } = await supabase
          .from('event_attendance')
          .select('event_id')
          .eq('user_id', user.id)
          .in('event_id', eventIds);

        const respondedIds = new Set(responded?.map(r => r.event_id) || []);
        unansweredCount = eventIds.filter(id => !respondedIds.has(id)).length;
      }
    }

    setTodayEvents(location.pathname.startsWith('/events') ? 0 : unansweredCount);
  }, []);

  useEffect(() => {
    fetchBadges();
  }, [location.pathname, fetchBadges]);

  // Realtime subscription for badge updates
  useRealtimeSubscription(
    `nav-badges-invitations-${userId}`,
    [{ table: "team_invitations", event: "*" }],
    fetchBadges,
    !!userId
  );

  useRealtimeSubscription(
    `nav-badges-attendance-${userId}`,
    [{ table: "event_attendance", event: "*" }],
    fetchBadges,
    !!userId
  );

  // Haptic feedback handler
  const handleNavPress = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      // Haptics not available (web browser)
    }
  };

  const navItems = [
    { titleKey: "nav.home", url: "/", icon: Home, badge: 0 },
    { titleKey: "nav.events", url: "/events", icon: Calendar, badge: todayEvents },
    { titleKey: "nav.teams", url: "/teams", icon: Users, badge: pendingInvites },
    { titleKey: "nav.profile", url: "/settings", icon: User, badge: 0 },
  ];

  return (
    <nav data-walkthrough="navigation" className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card backdrop-blur-lg h-[calc(50px+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-full items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.url || 
            (item.url !== "/" && location.pathname.startsWith(item.url));
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.url}
              to={item.url}
              onClick={handleNavPress}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0 px-3 py-1 rounded-lg transition-all duration-150 active:scale-[0.92] min-w-[56px] min-h-[38px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon 
                  className={cn(
                    "h-5 w-5 transition-all duration-150",
                    isActive && "fill-primary/20"
                  )} 
                />
                {/* Notification badge */}
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              
              {isActive && (
                <span className="text-[10px] font-semibold transition-all duration-150">
                  {t(item.titleKey)}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
