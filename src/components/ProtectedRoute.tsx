import { useEffect, useState, useRef } from "react";
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
  const onboardingCachedRef = useRef(false);

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

    // Re-check session on visibility change (for iframe sync after OAuth)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            setUser(session.user);
          }
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Check onboarding status when user is available
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user || skipOnboardingCheck) {
        if (user) setOnboardingCompleted(true);
        setLoading(false);
        return;
      }

      // Once onboarding is confirmed complete, never re-check
      if (onboardingCachedRef.current) {
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
          setOnboardingCompleted(true);
        } else {
          const completed = data?.onboarding_completed ?? false;
          setOnboardingCompleted(completed);
          if (completed) onboardingCachedRef.current = true;
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
