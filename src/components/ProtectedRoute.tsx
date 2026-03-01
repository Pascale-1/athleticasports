import { useEffect, useState, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { isSystemUsername } from "@/lib/usernameUtils";

interface ProtectedRouteProps {
  children: React.ReactNode;
  skipOnboardingCheck?: boolean;
  skipUsernameCheck?: boolean;
}

export const ProtectedRoute = ({ children, skipOnboardingCheck = false, skipUsernameCheck = false }: ProtectedRouteProps) => {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [hasCustomUsername, setHasCustomUsername] = useState<boolean | null>(null);
  const onboardingCachedRef = useRef(false);
  const usernameCachedRef = useRef(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setLoading(false);
        setOnboardingCompleted(null);
        setHasCustomUsername(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setLoading(false);
      }
    });

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

  // Check onboarding + username status when user is available
  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      if (skipOnboardingCheck && skipUsernameCheck) {
        setOnboardingCompleted(true);
        setHasCustomUsername(true);
        setLoading(false);
        return;
      }

      // Use cached values if available
      if (onboardingCachedRef.current && usernameCachedRef.current) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_completed, username')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking profile:', error);
          setOnboardingCompleted(true);
          setHasCustomUsername(true);
        } else {
          const completed = data?.onboarding_completed ?? false;
          setOnboardingCompleted(completed);
          if (completed) onboardingCachedRef.current = true;

          const customUsername = !isSystemUsername(data?.username);
          setHasCustomUsername(customUsername);
          if (customUsername) usernameCachedRef.current = true;
        }
      } catch (err) {
        console.error('Error checking profile:', err);
        setOnboardingCompleted(true);
        setHasCustomUsername(true);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      checkProfile();
    }
  }, [user, skipOnboardingCheck, skipUsernameCheck]);

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
  const isOnboardingPath = location.pathname.startsWith('/onboarding');
  if (!skipOnboardingCheck && onboardingCompleted === false && !isOnboardingPath) {
    return <Navigate to="/onboarding" replace />;
  }

  // Redirect to username selection if onboarding done but no custom username
  const isUsernamePath = location.pathname.startsWith('/choose-username');
  if (!skipUsernameCheck && onboardingCompleted === true && hasCustomUsername === false && !isUsernamePath) {
    return <Navigate to="/choose-username" replace />;
  }

  return <>{children}</>;
};
