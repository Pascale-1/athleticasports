import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { InstallPrompt } from "./components/InstallPrompt";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import Discover from "./pages/Discover";
import Community from "./pages/Community";
import Admin from "./pages/Admin";
import Track from "./pages/Track";
import ActivityHistory from "./pages/ActivityHistory";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Teams from "./pages/Teams";
import Users from "./pages/Users";
import TeamCreate from "./pages/TeamCreate";
import TeamDetail from "./pages/TeamDetail";
import TeamSettings from "./pages/TeamSettings";
import JoinTeam from "./pages/JoinTeam";
import AcceptInvitation from "./pages/AcceptInvitation";
import InvitationHelp from "./pages/InvitationHelp";
import NotFound from "./pages/NotFound";
import JoinEvent from "./pages/JoinEvent";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <InstallPrompt />
      <BrowserRouter>
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
