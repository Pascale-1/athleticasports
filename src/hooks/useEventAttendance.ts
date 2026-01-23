import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeSubscription } from "@/lib/realtimeManager";

export interface EventAttendanceStats {
  attending: number;
  maybe: number;
  not_attending: number;
  total: number;
}

export interface EventAttendee {
  id: string;
  user_id: string;
  status: 'attending' | 'maybe' | 'not_attending';
  responded_at: string;
  is_committed?: boolean;
  profiles?: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export const useEventAttendance = (eventId: string) => {
  const [stats, setStats] = useState<EventAttendanceStats>({
    attending: 0,
    maybe: 0,
    not_attending: 0,
    total: 0,
  });
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const [isCommitted, setIsCommitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Declare fetchAttendance BEFORE it's used
  const fetchAttendance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('[Attendance] Current user:', user?.id);

      // Fetch attendance stats
      const { data: attendanceData, error: attendanceError } = await supabase
        .from("event_attendance" as any)
        .select(`
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq("event_id", eventId);

      if (attendanceError) throw attendanceError;

      const typedData = (attendanceData || []) as unknown as EventAttendee[];

      const attending = typedData.filter(a => a.status === 'attending').length || 0;
      const maybe = typedData.filter(a => a.status === 'maybe').length || 0;
      const not_attending = typedData.filter(a => a.status === 'not_attending').length || 0;

      setStats({
        attending,
        maybe,
        not_attending,
        total: attending + maybe + not_attending,
      });

      setAttendees(typedData);

      // Get user's status
      if (user) {
        const userAttendance = typedData.find(a => a.user_id === user.id);
        setUserStatus(userAttendance?.status || null);
        setIsCommitted(userAttendance?.is_committed || false);
      }
    } catch (error) {
      console.error("[Attendance] Error fetching:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    fetchAttendance();
  }, [eventId]);

  // Use ref to store fetchAttendance for stable callback
  const fetchAttendanceRef = useRef(fetchAttendance);
  fetchAttendanceRef.current = fetchAttendance;

  // Realtime subscription using centralized manager
  const handleRealtimeChange = useCallback(() => {
    fetchAttendanceRef.current();
  }, []);

  useRealtimeSubscription(
    `event-attendance-${eventId}`,
    [{ table: "event_attendance", event: "*", filter: `event_id=eq.${eventId}` }],
    handleRealtimeChange,
    !!eventId
  );

  const updateAttendance = async (status: 'attending' | 'maybe' | 'not_attending') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("event_attendance" as any)
        .upsert({
          event_id: eventId,
          user_id: user.id,
          status,
        }, {
          onConflict: 'event_id,user_id'
        });

      if (error) throw error;

      // Sync with match proposals - auto-decline if not attending, auto-accept if attending
      if (status === 'not_attending') {
        await supabase
          .from("match_proposals")
          .update({
            status: "declined",
            responded_at: new Date().toISOString(),
          })
          .eq("event_id", eventId)
          .eq("player_user_id", user.id)
          .eq("status", "pending");
      } else if (status === 'attending') {
        await supabase
          .from("match_proposals")
          .update({
            status: "accepted",
            responded_at: new Date().toISOString(),
            commitment_acknowledged_at: new Date().toISOString(),
          })
          .eq("event_id", eventId)
          .eq("player_user_id", user.id)
          .eq("status", "pending");
      }

      setUserStatus(status);
      
      toast({
        title: "Success",
        description: "Your attendance has been updated",
      });

      return true;
    } catch (error: any) {
      console.error("Error updating attendance:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update attendance",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeAttendance = async () => {
    try {
      // Check if committed - cannot remove committed attendance
      if (isCommitted) {
        toast({
          title: "Cannot cancel",
          description: "You are committed to this match and cannot cancel.",
          variant: "destructive",
        });
        return false;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("event_attendance" as any)
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", user.id);

      if (error) throw error;

      setUserStatus(null);
      setIsCommitted(false);
      
      toast({
        title: "Success",
        description: "Your attendance has been removed",
      });

      return true;
    } catch (error: any) {
      console.error("Error removing attendance:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove attendance",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    stats,
    attendees,
    userStatus,
    isCommitted,
    loading,
    updateAttendance,
    removeAttendance,
    refetch: fetchAttendance,
  };
};
