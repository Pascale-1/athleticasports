import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    fetchAttendance();

    const channel = supabase
      .channel(`event-attendance-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_attendance",
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          fetchAttendance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  const fetchAttendance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

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
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("event_attendance" as any)
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", user.id);

      if (error) throw error;

      setUserStatus(null);
      
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
    loading,
    updateAttendance,
    removeAttendance,
    refetch: fetchAttendance,
  };
};
