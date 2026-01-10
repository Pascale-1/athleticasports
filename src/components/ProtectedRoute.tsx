import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  skipOnboardingCheck?: boolean;
}

export const ProtectedRoute = ({ children, skipOnboardingCheck = false }: ProtectedRouteProps) => {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setLoading(false);
        setOnboardingCompleted(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check onboarding status when user is available
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user || skipOnboardingCheck) {
        if (user) setOnboardingCompleted(true); // Skip check means treat as completed
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking onboarding:', error);
          setOnboardingCompleted(true); // Default to true on error
        } else {
          setOnboardingCompleted(data?.onboarding_completed ?? false);
        }
      } catch (err) {
        console.error('Error checking onboarding:', err);
        setOnboardingCompleted(true);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      checkOnboarding();
    }
  }, [user, skipOnboardingCheck]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to onboarding if not completed
  // Guard against redirect loops by checking multiple conditions:
  // 1. skipOnboardingCheck must be false
  // 2. onboardingCompleted must be explicitly false (not null/undefined)
  // 3. Current path must not be onboarding or any of its sub-routes
  const isOnboardingPath = location.pathname.startsWith('/onboarding');
  if (!skipOnboardingCheck && onboardingCompleted === false && !isOnboardingPath) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
