import { BottomNavigation } from "./BottomNavigation";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AppSidebar } from "@/components/app-sidebar";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export const MobileLayout = ({ children }: MobileLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen w-full max-w-[100vw] flex-col overflow-x-hidden">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-4 border-b border-border/50 bg-background/95 backdrop-blur-lg px-4 shadow-sm max-w-full">
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <button className="lg:hidden p-2 -ml-2 hover:bg-accent rounded-lg transition-colors">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <AppSidebar />
            </SheetContent>
          </Sheet>
        )}
        
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold text-sm">A</span>
          </div>
          <h1 className="text-base md:text-lg font-heading font-bold text-primary truncate max-w-[150px] sm:max-w-none">
            Athletica
          </h1>
        </div>
        
        <div className="ml-auto">
          <NotificationBell />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 lg:pb-0 overflow-x-hidden max-w-full">
        <div className="mx-auto w-full max-w-[100vw] overflow-x-hidden">
          {children}
        </div>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNavigation />
    </div>
  );
};
