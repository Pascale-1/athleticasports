import { BottomNavigation } from "./BottomNavigation";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { cn } from "@/lib/utils";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export const MobileLayout = ({ children }: MobileLayoutProps) => {
  const scrollDirection = useScrollDirection(10);

  return (
    <div className="flex min-h-screen w-full max-w-[100vw] flex-col overflow-x-hidden">
      {/* Mobile Header - Slimmer design */}
      <header className={cn(
        "sticky top-0 z-40 flex h-12 shrink-0 items-center gap-3 border-b border-border/50 bg-background/95 backdrop-blur-lg px-4 shadow-sm max-w-full overflow-hidden transition-transform duration-300 ease-in-out",
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
        
        <div className="ml-auto">
          <NotificationBell />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-16 lg:pb-0 overflow-x-hidden max-w-full">
        <div className="mx-auto w-full max-w-[100vw] overflow-x-hidden">
          {children}
        </div>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNavigation />
    </div>
  );
};
