import { BottomNavigation } from "./BottomNavigation";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export const MobileLayout = ({ children }: MobileLayoutProps) => {
  const scrollDirection = useScrollDirection(10);

  return (
    <div className="flex min-h-screen w-full max-w-[100vw] flex-col overflow-x-hidden pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      {/* Mobile Header - Slimmer design */}
      <header className={cn(
        "sticky top-0 z-40 flex shrink-0 items-center gap-3 border-b border-border/50 bg-background/95 backdrop-blur-lg px-4 shadow-sm max-w-full overflow-hidden transition-transform duration-300 ease-in-out",
        "h-[calc(3rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)]",
        scrollDirection === "down" && "transform -translate-y-full"
      )}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold text-xs">A</span>
          </div>
          <h1 className="text-sm font-heading font-bold text-primary hidden xs:block">
            Athletica
          </h1>
        </div>
        
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </Button>
          <NotificationBell />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden max-w-full pb-[calc(50px+env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-[100vw] overflow-x-hidden">
          {children}
        </div>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNavigation />
    </div>
  );
};
