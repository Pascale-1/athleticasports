import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { InstallPrompt } from "./components/InstallPrompt";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Loader2 } from "lucide-react";

// Lazy load all route components for code splitting
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Settings = lazy(() => import("./pages/Settings"));
const Discover = lazy(() => import("./pages/Discover"));
const Community = lazy(() => import("./pages/Community"));
const Admin = lazy(() => import("./pages/Admin"));
const Track = lazy(() => import("./pages/Track"));
const ActivityHistory = lazy(() => import("./pages/ActivityHistory"));
const Events = lazy(() => import("./pages/Events"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const Teams = lazy(() => import("./pages/Teams"));
const Users = lazy(() => import("./pages/Users"));
const TeamCreate = lazy(() => import("./pages/TeamCreate"));
const TeamDetail = lazy(() => import("./pages/TeamDetail"));
const TeamEvents = lazy(() => import("./pages/TeamEvents"));
const TeamPerformance = lazy(() => import("./pages/TeamPerformance"));
const TeamMembers = lazy(() => import("./pages/TeamMembers"));
const TeamSettings = lazy(() => import("./pages/TeamSettings"));
const JoinTeam = lazy(() => import("./pages/JoinTeam"));
const AcceptInvitation = lazy(() => import("./pages/AcceptInvitation"));
const InvitationHelp = lazy(() => import("./pages/InvitationHelp"));
const NotFound = lazy(() => import("./pages/NotFound"));
const JoinEvent = lazy(() => import("./pages/JoinEvent"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Optimized QueryClient with better caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <InstallPrompt />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout>
                <Index />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <AppLayout>
                <Settings />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/discover" element={
            <ProtectedRoute>
              <AppLayout>
                <Discover />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/community" element={
            <ProtectedRoute>
              <AppLayout>
                <Community />
              </AppLayout>
            </ProtectedRoute>
          } />
          {/* Redirects for old routes */}
          <Route path="/users" element={
            <ProtectedRoute>
              <AppLayout>
                <Users />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/teams" element={
            <ProtectedRoute>
              <AppLayout>
                <Teams />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AppLayout>
                <Admin />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/track" element={
            <ProtectedRoute>
              <AppLayout>
                <Track />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/activity-history" element={
            <ProtectedRoute>
              <AppLayout>
                <ActivityHistory />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/events" element={
            <ProtectedRoute>
              <AppLayout>
                <Events />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/events/:eventId" element={
            <ProtectedRoute>
              <AppLayout>
                <EventDetail />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/teams/create" element={
            <ProtectedRoute>
              <AppLayout>
                <TeamCreate />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/teams/:teamId" element={
            <ProtectedRoute>
              <AppLayout>
                <TeamDetail />
              </AppLayout>
            </ProtectedRoute>
          } />
            <Route path="/teams/:teamId/events" element={
              <ProtectedRoute>
                <AppLayout>
                  <TeamEvents />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/teams/:teamId/performance" element={
              <ProtectedRoute>
                <AppLayout>
                  <TeamPerformance />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/teams/:teamId/members" element={
              <ProtectedRoute>
                <AppLayout>
                  <TeamMembers />
                </AppLayout>
              </ProtectedRoute>
            } />
          <Route path="/teams/:teamId/settings" element={
            <ProtectedRoute>
              <AppLayout>
                <TeamSettings />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/teams/join/:code" element={<JoinTeam />} />
          <Route path="/teams/invitations/accept" element={<AcceptInvitation />} />
          <Route path="/teams/invitations/help" element={<InvitationHelp />} />
          <Route path="/events/join/:code" element={<JoinEvent />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
