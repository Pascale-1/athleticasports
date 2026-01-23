import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { UserPlus, Megaphone, Calendar, UserCheck, CheckCircle, Swords, Users, Bell, ChevronRight } from "lucide-react";
import { useNotificationContext, type Notification } from "@/contexts/NotificationContext";
import { cn } from "@/lib/utils";
import { getLocale } from "@/lib/dateUtils";
import { Button } from "@/components/ui/button";

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
  match_proposal: Swords,
  player_available: Users,
  event_attendance: UserCheck,
};

const colorMap: Record<string, string> = {
  team_invitation: "bg-info/10 text-info",
  new_follower: "bg-success/10 text-success",
  team_announcement: "bg-warning/10 text-warning",
  training_session: "bg-primary/10 text-primary",
  event_join_request: "bg-info/10 text-info",
  event_join_response: "bg-success/10 text-success",
  match_proposal: "bg-warning/10 text-warning",
  player_available: "bg-primary/10 text-primary",
  event_attendance: "bg-success/10 text-success",
};

// Notifications that should show a quick action button
const actionableTypes = ['team_invitation', 'event_join_request', 'match_proposal'];

const FallbackIcon = Bell;

export const NotificationItem = ({ notification }: NotificationItemProps) => {
  const navigate = useNavigate();
  const { markAsRead } = useNotificationContext();
  const Icon = iconMap[notification.type] || FallbackIcon;
  const iconBgColor = colorMap[notification.type] || "bg-muted text-muted-foreground";
  const locale = getLocale();
  const isActionable = actionableTypes.includes(notification.type);

  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      const url = new URL(notification.link, window.location.origin);
      const tab = url.searchParams.get('tab');
      
      if (tab) {
        navigate(url.pathname + url.search);
      } else {
        navigate(notification.link);
      }
    }
  };

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClick();
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "p-3 cursor-pointer transition-colors hover:bg-muted/50 flex gap-3",
        !notification.read && "bg-primary/5"
      )}
    >
      {/* Unread dot + Icon */}
      <div className="relative shrink-0">
        {!notification.read && (
          <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-primary" />
        )}
        <div className={cn("p-2 rounded-lg", iconBgColor)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn("text-card-title leading-tight", !notification.read && "font-semibold")}>
          {notification.title}
        </p>
        <p className="text-caption text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-micro text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale })}
        </p>
      </div>
      
      {/* Action or Chevron */}
      <div className="shrink-0 flex items-center">
        {isActionable && notification.link ? (
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-[10px] gap-1"
            onClick={handleAction}
          >
            View
            <ChevronRight className="h-3 w-3" />
          </Button>
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
        )}
      </div>
    </div>
  );
};
