import { Home, Users, Calendar, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const BottomNavigation = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const [pendingInvites, setPendingInvites] = useState(0);
  const [todayEvents, setTodayEvents] = useState(0);

  // Fetch notification badges
  useEffect(() => {
    const fetchBadges = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get pending team invitations
      const { count: inviteCount } = await supabase
        .from('team_invitations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .eq('email', user.email);

      setPendingInvites(inviteCount || 0);

      // Get today's events count
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { count: eventCount } = await supabase
        .from('event_attendance')
        .select('*, events!inner(*)', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'attending')
        .gte('events.start_time', today.toISOString())
        .lt('events.start_time', tomorrow.toISOString());

      setTodayEvents(eventCount || 0);
    };

    fetchBadges();
  }, [location.pathname]);

  const navItems = [
    { titleKey: "nav.home", url: "/", icon: Home, badge: 0 },
    { titleKey: "nav.events", url: "/events", icon: Calendar, badge: todayEvents },
    { titleKey: "nav.teams", url: "/teams", icon: Users, badge: pendingInvites },
    { titleKey: "nav.profile", url: "/settings", icon: User, badge: 0 },
  ];

  return (
    <nav data-walkthrough="navigation" className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-14 border-t border-border/50 bg-background/95 backdrop-blur-lg shadow-lg">
      <div className="flex h-full items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.url || 
            (item.url !== "/" && location.pathname.startsWith(item.url));
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.url}
              to={item.url}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-150 active:scale-95 min-w-[64px] min-h-[44px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Active indicator line */}
              {isActive && (
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
              )}
              
              <div className="relative">
                <Icon 
                  className={cn(
                    "h-5 w-5 transition-all duration-150",
                    isActive && "fill-primary/20"
                  )} 
                />
                {/* Notification badge */}
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              
              <span className={cn(
                "text-[10px] font-medium transition-all duration-150 truncate max-w-[72px]",
                isActive && "font-semibold"
              )}>
                {t(item.titleKey)}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
