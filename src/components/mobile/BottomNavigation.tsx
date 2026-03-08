import { Home, Users, Calendar, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSubscription } from "@/lib/realtimeManager";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const fetchBadgeCounts = async (userId: string) => {
  // Get pending team invitations
  const [profileRes, authRes] = await Promise.all([
    supabase.from('profiles_public' as any).select('username').eq('user_id', userId).single() as Promise<{ data: { username: string } | null }>,
    supabase.auth.getUser(),
  ]);

  const profile = profileRes.data;
  const userEmail = authRes.data?.user?.email;

  let pendingInvites = 0;
  if (profile) {
    const orFilters = [`invited_user_id.eq.${userId}`];
    if (profile.username) orFilters.push(`email.eq.${profile.username}`);
    if (userEmail) orFilters.push(`email.eq.${userEmail}`);

    const { count: inviteCount } = await supabase
      .from('team_invitations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .or(orFilters.join(','));

    pendingInvites = inviteCount || 0;
  }

  return { pendingInvites };
};

export const BottomNavigation = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id ?? null;

  const { data: badges } = useQuery({
    queryKey: ['navigation-badges', userId],
    queryFn: () => fetchBadgeCounts(userId!),
    enabled: !!userId,
    staleTime: 30_000, // Cache for 30s — prevents re-fetch on every route change
    refetchInterval: 60_000, // Background refresh every 60s
  });

  const pendingInvites = badges?.pendingInvites ?? 0;

  // Invalidate badges on realtime changes
  const invalidateBadges = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['navigation-badges', userId] });
  }, [queryClient, userId]);

  useRealtimeSubscription(
    `nav-badges-invitations-${userId}`,
    [{ table: "team_invitations", event: "*" }],
    invalidateBadges,
    !!userId
  );

  useRealtimeSubscription(
    `nav-badges-attendance-${userId}`,
    [{ table: "event_attendance", event: "*" }],
    invalidateBadges,
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
    { titleKey: "nav.events", url: "/events", icon: Calendar, badge: 0 },
    { titleKey: "nav.teams", url: "/teams", icon: Users, badge: pendingInvites },
    { titleKey: "nav.profile", url: "/settings", icon: User, badge: 0 },
  ];

  return (
    <nav data-walkthrough="navigation" className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card backdrop-blur-lg h-[calc(50px+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
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
              
              <span className={cn(
                "text-[10px] transition-all duration-150",
                isActive ? "font-semibold text-primary" : "font-normal text-muted-foreground"
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
