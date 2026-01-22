import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeSubscription } from "@/lib/realtimeManager";

export interface Notification {
  id: string;
  user_id: string;
  type: "team_invitation" | "new_follower" | "team_announcement" | "training_session" | "event_join_request" | "event_join_response" | "match_proposal" | "player_available" | "event_attendance";
  title: string;
  message: string;
  link: string | null;
  metadata: Record<string, any>;
  read: boolean;
  created_at: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationContext must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const notificationsRef = useRef(notifications);
  notificationsRef.current = notifications;

  const fetchNotifications = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }

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
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRealtimeChange = useCallback((payload: any) => {
    if (payload.eventType === "INSERT") {
      const newNotification = payload.new as Notification;
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      toast({
        title: newNotification.title,
        description: newNotification.message,
      });
    } else if (payload.eventType === "UPDATE") {
      const updatedNotification = payload.new as Notification;
      setNotifications((prev) =>
        prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n))
      );

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
    "user-notifications-context",
    [
      { table: "notifications", event: "INSERT" },
      { table: "notifications", event: "UPDATE" },
    ],
    handleRealtimeChange,
    true
  );

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase.rpc("mark_notification_read", {
        notification_id: notificationId,
      });

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.rpc("mark_all_notifications_read", {
        _user_id: user.id,
      });

      if (error) throw error;

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refetch: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
