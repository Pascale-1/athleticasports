import { Home, Users, Calendar, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export const BottomNavigation = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { titleKey: "nav.home", url: "/", icon: Home },
    { titleKey: "nav.events", url: "/events", icon: Calendar },
    { titleKey: "nav.teams", url: "/teams", icon: Users },
    { titleKey: "nav.profile", url: "/settings", icon: User },
  ];

  return (
    <nav data-walkthrough="navigation" className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-14 border-t border-border/50 bg-background/95 backdrop-blur-lg shadow-lg">
      <div className="flex h-full items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.url;
          const Icon = item.icon;
          
          return (
              <NavLink
              key={item.url}
              to={item.url}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-150 active:scale-95 min-w-[64px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon 
                className={cn(
                  "h-4 w-4 transition-all duration-150",
                  isActive && "fill-current"
                )} 
              />
              <span className={cn(
                "text-[11px] font-medium transition-all duration-150 truncate max-w-[72px]",
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
