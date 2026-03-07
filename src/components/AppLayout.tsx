import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();

  // Use mobile layout for mobile/tablet devices
  if (isMobile) {
    return <MobileLayout>{children}</MobileLayout>;
  }

  // Desktop layout with sidebar
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border/50 bg-background/95 backdrop-blur-lg px-4 sm:px-6 shadow-sm">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-5 bg-border/50" />
            <h1 className="text-lg font-heading font-bold text-primary">
              Athletica Sports
            </h1>
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
          <main className="flex-1 p-6 md:p-8 bg-background min-h-screen">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
