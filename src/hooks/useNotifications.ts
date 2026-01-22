import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeSubscription } from "@/lib/realtimeManager";

export interface Notification {
  id: string;
  user_id: string;
  type: "team_invitation" | "new_follower" | "team_announcement" | "training_session" | "event_join_request";
  title: string;
  message: string;
  link: string | null;
  metadata: Record<string, any>;
  read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch recent notifications (last 30 days, limit 50)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .gte("created_at", thirtyDaysAgo.toISOString())
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;

        setNotifications((data || []) as Notification[]);
        setUnreadCount(data?.filter(n => !n.read).length || 0);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [toast]);

  // Refs for accessing current state in callbacks
  const notificationsRef = useRef(notifications);
  notificationsRef.current = notifications;

  // Realtime subscription using centralized manager
  const handleRealtimeChange = useCallback((payload: any) => {
    if (payload.eventType === "INSERT") {
      const newNotification = payload.new as Notification;
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show toast for new notification
      toast({
        title: newNotification.title,
        description: newNotification.message,
      });
    } else if (payload.eventType === "UPDATE") {
      const updatedNotification = payload.new as Notification;
      setNotifications((prev) =>
        prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n))
      );

      // Update unread count
      setUnreadCount((prev) => {
        const oldNotification = notificationsRef.current.find(n => n.id === updatedNotification.id);
        if (oldNotification && !oldNotification.read && updatedNotification.read) {
          return Math.max(0, prev - 1);
        }
        return prev;
      });
    }
  }, [toast]);

  useRealtimeSubscription(
    "user-notifications",
    [
      { table: "notifications", event: "INSERT" },
      { table: "notifications", event: "UPDATE" },
    ],
    handleRealtimeChange,
    true
  );

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase.rpc("mark_notification_read", {
        notification_id: notificationId,
      });

      if (error) throw error;

      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.rpc("mark_all_notifications_read", {
        _user_id: user.id,
      });

      if (error) throw error;

      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  };
};
