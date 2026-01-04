import { Home, Users, Calendar, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Events", url: "/events", icon: Calendar },
  { title: "Teams", url: "/teams", icon: Users },
  { title: "Profile", url: "/settings", icon: User },
];

export const BottomNavigation = () => {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-border/50 bg-background/95 backdrop-blur-lg shadow-lg">
      <div className="flex h-full items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.url;
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.url}
              to={item.url}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all duration-150 active:scale-95 min-w-[64px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon 
                className={cn(
                  "h-5 w-5 transition-all duration-150",
                  isActive && "fill-current"
                )} 
              />
              <span className={cn(
                "text-xs font-medium transition-all duration-150",
                isActive && "font-semibold"
              )}>
                {item.title}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
