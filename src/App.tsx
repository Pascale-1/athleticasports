import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import Admin from "./pages/Admin";
import Teams from "./pages/Teams";
import TeamCreate from "./pages/TeamCreate";
import TeamDetail from "./pages/TeamDetail";
import TeamSettings from "./pages/TeamSettings";
import AcceptInvitation from "./pages/AcceptInvitation";
import InvitationHelp from "./pages/InvitationHelp";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
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
          <Route path="/users" element={
            <ProtectedRoute>
              <AppLayout>
                <Users />
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
          <Route path="/teams" element={
            <ProtectedRoute>
              <AppLayout>
                <Teams />
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
          <Route path="/teams/invitations/accept" element={<AcceptInvitation />} />
          <Route path="/teams/invitations/help" element={<InvitationHelp />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
