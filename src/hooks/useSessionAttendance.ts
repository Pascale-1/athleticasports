import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type AttendanceStatus = "attending" | "not_attending" | "maybe";

export interface SessionAttendance {
  id: string;
  session_id: string;
  user_id: string;
  status: AttendanceStatus;
  responded_at: string;
  updated_at: string;
  profile?: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface AttendanceStats {
  attending: number;
  not_attending: number;
  maybe: number;
  not_responded: number;
}

export const useSessionAttendance = (
  sessionId: string | null,
  totalMembers: number
) => {
  const [attendance, setAttendance] = useState<SessionAttendance[]>([]);
  const [userStatus, setUserStatus] = useState<AttendanceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    const fetchAttendance = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch all attendance records
        const { data: attendanceData, error: attendanceError } = await supabase
          .from("training_session_attendance")
          .select("*")
          .eq("session_id", sessionId);

        if (attendanceError) throw attendanceError;

        // Fetch profiles for all users in attendance
        if (attendanceData && attendanceData.length > 0) {
          const userIds = attendanceData.map(a => a.user_id);
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("user_id, username, display_name, avatar_url")
            .in("user_id", userIds);

          if (profilesError) throw profilesError;

          // Merge attendance with profiles
          const merged = attendanceData.map(a => ({
            ...a,
            status: a.status as AttendanceStatus,
            profile: profilesData?.find(p => p.user_id === a.user_id),
          }));

          setAttendance(merged);

          // Find current user's status
          const userAttendance = merged.find((a) => a.user_id === user.id);
          setUserStatus(userAttendance?.status || null);
        } else {
          setAttendance([]);
          setUserStatus(null);
        }
      } catch (error) {
        console.error("Error fetching attendance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`attendance-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "training_session_attendance",
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          fetchAttendance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const stats: AttendanceStats = {
    attending: attendance.filter((a) => a.status === "attending").length,
    not_attending: attendance.filter((a) => a.status === "not_attending").length,
    maybe: attendance.filter((a) => a.status === "maybe").length,
    not_responded: totalMembers - attendance.length,
  };

  const setAttendanceStatus = async (status: AttendanceStatus) => {
    if (!sessionId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if user already has an attendance record
      const existing = attendance.find((a) => a.user_id === user.id);

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from("training_session_attendance")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from("training_session_attendance")
          .insert({
            session_id: sessionId,
            user_id: user.id,
            status,
          });

        if (error) throw error;
      }

      setUserStatus(status);
      
      const statusText = status === "attending" ? "Attending" : 
                        status === "not_attending" ? "Not Attending" : "Maybe";
      
      toast({
        title: "Attendance Updated",
        description: `You're marked as ${statusText}`,
      });
    } catch (error: any) {
      console.error("Error updating attendance:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update attendance",
        variant: "destructive",
      });
    }
  };

  const clearAttendance = async () => {
    if (!sessionId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const existing = attendance.find((a) => a.user_id === user.id);
      if (!existing) return;

      const { error } = await supabase
        .from("training_session_attendance")
        .delete()
        .eq("id", existing.id);

      if (error) throw error;

      setUserStatus(null);
      toast({
        title: "Attendance Cleared",
        description: "Your response has been removed",
      });
    } catch (error: any) {
      console.error("Error clearing attendance:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to clear attendance",
        variant: "destructive",
      });
    }
  };

  return {
    attendance,
    stats,
    userStatus,
    loading,
    setAttendance: setAttendanceStatus,
    clearAttendance,
  };
};
