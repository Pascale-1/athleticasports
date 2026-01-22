import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { UserPlus, Megaphone, Calendar, UserCheck, CheckCircle, XCircle, Bell } from "lucide-react";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: Notification;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  team_invitation: UserPlus,
  new_follower: UserPlus,
  team_announcement: Megaphone,
  training_session: Calendar,
  event_join_request: UserCheck,
  event_join_response: CheckCircle,
};

const colorMap: Record<string, string> = {
  team_invitation: "text-blue-500",
  new_follower: "text-green-500",
  team_announcement: "text-orange-500",
  training_session: "text-purple-500",
  event_join_request: "text-teal-500",
  event_join_response: "text-emerald-500",
};

// Fallback icon for unknown notification types
const FallbackIcon = Bell;

export const NotificationItem = ({ notification }: NotificationItemProps) => {
  const navigate = useNavigate();
  const { markAsRead } = useNotifications();
  const Icon = iconMap[notification.type] || FallbackIcon;
  const iconColor = colorMap[notification.type] || "text-muted-foreground";

  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      // Parse the link to check for tab parameter
      const url = new URL(notification.link, window.location.origin);
      const tab = url.searchParams.get('tab');
      
      if (tab) {
        // Navigate to the path and let the component handle the tab
        navigate(url.pathname + url.search);
      } else {
        navigate(notification.link);
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "p-4 cursor-pointer transition-colors hover:bg-muted/50",
        !notification.read && "bg-muted/30 border-l-4 border-primary"
      )}
    >
      <div className="flex gap-3">
        <div className={cn("mt-1", iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm", !notification.read && "font-semibold")}>
            {notification.title}
          </p>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
};
