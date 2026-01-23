import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSubscription } from "@/lib/realtimeManager";

export const usePendingInvitations = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCount = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCount(0);
        setLoading(false);
        return;
      }

      // Get user's profile to match by email
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, email")
        .eq("user_id", user.id)
        .single();

      if (!profile) {
        setCount(0);
        setLoading(false);
        return;
      }

      // Check for pending invitations matching user_id or email/username
      const { count: invitationCount, error } = await supabase
        .from("team_invitations")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")
        .or(`invited_user_id.eq.${user.id},email.eq.${profile.username},email.eq.${profile.email || ''}`);

      if (error) {
        console.error("Error fetching pending invitations:", error);
        setCount(0);
      } else {
        setCount(invitationCount || 0);
      }
    } catch (error) {
      console.error("Error in usePendingInvitations:", error);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  // Realtime subscription
  useRealtimeSubscription(
    "pending-invitations-count",
    [{ table: "team_invitations", event: "*" }],
    fetchCount,
    true
  );

  return { count, loading, refetch: fetchCount };
};
