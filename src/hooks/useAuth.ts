import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

/**
 * Lightweight auth hook that caches the current user from onAuthStateChange.
 * Eliminates redundant supabase.auth.getUser() network calls across components.
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (!initializedRef.current) {
          initializedRef.current = true;
          setLoading(false);
        }
      }
    );

    // Seed initial value
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!initializedRef.current) {
        initializedRef.current = true;
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
