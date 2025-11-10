import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { NotificationBell } from "@/components/notifications/NotificationBell";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 md:h-18 shrink-0 items-center gap-2 border-b-2 border-primary/10 bg-gradient-to-r from-background via-background to-background/95 backdrop-blur-sm px-4 sm:px-6 shadow-sm">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-5 bg-border/50" />
            <h1 className="text-lg md:text-xl font-heading font-bold bg-gradient-to-r from-primary via-primary-glow to-rose bg-clip-text text-transparent">
              Athletica Sports
            </h1>
            <div className="ml-auto">
              <NotificationBell />
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gradient-to-br from-background via-background to-neutral-50/30 dark:to-neutral-900/30 min-h-screen">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
