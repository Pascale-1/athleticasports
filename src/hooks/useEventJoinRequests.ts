import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useRealtimeSubscription } from "@/lib/realtimeManager";

export interface EventJoinRequest {
  id: string;
  event_id: string;
  user_id: string;
  status: "pending" | "approved" | "rejected";
  message: string | null;
  created_at: string;
  updated_at: string;
  responded_at: string | null;
  responded_by: string | null;
  profile?: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export const useEventJoinRequests = (eventId: string) => {
  const [requests, setRequests] = useState<EventJoinRequest[]>([]);
  const [userRequest, setUserRequest] = useState<EventJoinRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation("events");

  const fetchRequests = useCallback(async () => {
    if (!eventId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch all requests for this event (organizers will see all, users see their own via RLS)
      const { data, error } = await supabase
        .from("event_join_requests")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for all requesters
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(r => r.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, username, display_name, avatar_url")
          .in("user_id", userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        
        const requestsWithProfiles = data.map(request => ({
          ...request,
          status: request.status as "pending" | "approved" | "rejected",
          profile: profileMap.get(request.user_id),
        }));

        setRequests(requestsWithProfiles);
        
        // Find current user's request
        const myRequest = requestsWithProfiles.find(r => r.user_id === user.id);
        setUserRequest(myRequest || null);
      } else {
        setRequests([]);
        setUserRequest(null);
      }
    } catch (error) {
      console.error("Error fetching join requests:", error);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Realtime subscription
  const handleRealtimeChange = useCallback(() => {
    fetchRequests();
  }, [fetchRequests]);

  useRealtimeSubscription(
    `event-join-requests-${eventId}`,
    [
      { table: "event_join_requests", event: "INSERT", filter: `event_id=eq.${eventId}` },
      { table: "event_join_requests", event: "UPDATE", filter: `event_id=eq.${eventId}` },
    ],
    handleRealtimeChange,
    !!eventId
  );

  const sendRequest = async (message?: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t("common:error"),
          description: "You must be logged in",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from("event_join_requests")
        .insert({
          event_id: eventId,
          user_id: user.id,
          message: message || null,
        });

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation - already requested
          toast({
            title: t("joinRequests.alreadyRequested"),
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return false;
      }

      toast({
        title: t("joinRequests.requestSent"),
        description: t("joinRequests.requestSentDesc"),
      });

      await fetchRequests();
      return true;
    } catch (error) {
      console.error("Error sending join request:", error);
      toast({
        title: t("common:error"),
        description: "Failed to send request",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateRequestStatus = async (
    requestId: string,
    status: "approved" | "rejected"
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from("event_join_requests")
        .update({
          status,
          responded_at: new Date().toISOString(),
          responded_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) throw error;

      // Note: Attendance is automatically created by database trigger
      // when status changes to 'approved'

      toast({
        title: status === "approved" ? t("joinRequests.approved") : t("joinRequests.rejected"),
      });

      await fetchRequests();
      return true;
    } catch (error) {
      console.error("Error updating request:", error);
      toast({
        title: t("common:error"),
        variant: "destructive",
      });
      return false;
    }
  };

  const approveRequest = (requestId: string) => updateRequestStatus(requestId, "approved");
  const rejectRequest = (requestId: string) => updateRequestStatus(requestId, "rejected");

  const pendingRequests = requests.filter(r => r.status === "pending");

  return {
    requests,
    pendingRequests,
    userRequest,
    loading,
    sendRequest,
    approveRequest,
    rejectRequest,
    refetch: fetchRequests,
  };
};
