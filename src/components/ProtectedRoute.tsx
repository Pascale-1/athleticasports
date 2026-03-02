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
  const currentUserIdRef = useRef<string | null>(null);
  const initialCheckDoneRef = useRef(false);

  useEffect(() => {
    const updateUser = (sessionUser: User | null) => {
      const newId = sessionUser?.id ?? null;
      // Always process the first callback; deduplicate subsequent ones
      if (initialCheckDoneRef.current && newId === currentUserIdRef.current) return;
      initialCheckDoneRef.current = true;
      currentUserIdRef.current = newId;
      setUser(sessionUser);
      if (!sessionUser) {
        setLoading(false);
        setOnboardingCompleted(null);
        setHasCustomUsername(null);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      updateUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      updateUser(session?.user ?? null);
    });

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        supabase.auth.getSession().then(({ data: { session } }) => {
          updateUser(session?.user ?? null);
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

      // Use cached values if available (sessionStorage persists across route navigations)
      // Version 2: bumped after resetting all existing usernames to user_ format
      const cacheKey = `username_ok_v2_${user.id}`;
      const usernameCached = sessionStorage.getItem(cacheKey) === '1';
      if (onboardingCachedRef.current && usernameCached) {
        setOnboardingCompleted(true);
        setHasCustomUsername(true);
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
          if (customUsername) {
            sessionStorage.setItem(`username_ok_v2_${user.id}`, '1');
          }
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
