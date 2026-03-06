import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSubscription } from "@/lib/realtimeManager";

export interface PendingInvitation {
  id: string;
  team_id: string;
  role: string;
  email: string;
  created_at: string;
  expires_at: string;
  invited_by: string;
  team_name: string;
  team_sport: string | null;
  team_avatar_url: string | null;
  inviter_name: string | null;
}

export const usePendingInvitations = () => {
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvitations = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setInvitations([]);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("username, email")
        .eq("user_id", user.id)
        .single();

      if (!profile) {
        setInvitations([]);
        setLoading(false);
        return;
      }

      const filters = [`invited_user_id.eq.${user.id}`];
      if (profile.username) filters.push(`email.eq.${profile.username}`);
      if (profile.email) filters.push(`email.eq.${profile.email}`);

      const { data: rawInvitations, error } = await supabase
        .from("team_invitations")
        .select("id, team_id, role, email, created_at, expires_at, invited_by")
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString())
        .or(filters.join(","))
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching pending invitations:", error);
        setInvitations([]);
        setLoading(false);
        return;
      }

      if (!rawInvitations || rawInvitations.length === 0) {
        setInvitations([]);
        setLoading(false);
        return;
      }

      // Fetch team details
      const teamIds = [...new Set(rawInvitations.map(i => i.team_id))];
      const inviterIds = [...new Set(rawInvitations.map(i => i.invited_by))];

      const [teamDetails, invitersResult] = await Promise.all([
        Promise.all(
          teamIds.map(tid =>
            supabase.rpc('get_team_info_for_invitation' as any, { _team_id: tid, _user_id: user.id }).single()
          )
        ),
        supabase.from("profiles").select("user_id, display_name, username").in("user_id", inviterIds),
      ]);

      const teamsMap = new Map<string, { id: string; name: string; sport: string | null; avatar_url: string | null }>(
        teamDetails
          .filter((r: any) => r.data)
          .map((r: any) => [r.data.id, r.data])
      );
      const invitersMap = new Map((invitersResult.data || []).map(p => [p.user_id, p]));

      const enriched: PendingInvitation[] = rawInvitations.map(inv => {
        const team = teamsMap.get(inv.team_id);
        const inviter = invitersMap.get(inv.invited_by);
        return {
          ...inv,
          team_name: team?.name || "Unknown team",
          team_sport: team?.sport || null,
          team_avatar_url: team?.avatar_url || null,
          inviter_name: inviter?.display_name || inviter?.username || null,
        };
      });

      setInvitations(enriched);
    } catch (error) {
      console.error("Error in usePendingInvitations:", error);
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  useRealtimeSubscription(
    "pending-invitations-count",
    [{ table: "team_invitations", event: "*" }],
    fetchInvitations,
    true
  );

  const removeInvitation = (id: string) => {
    setInvitations(prev => prev.filter(i => i.id !== id));
  };

  return { count: invitations.length, invitations, loading, refetch: fetchInvitations, removeInvitation };
};
