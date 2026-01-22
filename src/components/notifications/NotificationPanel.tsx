import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { NotificationItem } from "./NotificationItem";
import { EmptyNotifications } from "./EmptyNotifications";
import { Loader2 } from "lucide-react";

export const NotificationPanel = () => {
  const { notifications, loading, markAllAsRead } = useNotificationContext();
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between p-4 pb-3">
        <h3 className="font-semibold text-lg">Notifications</h3>
        {notifications.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={markAllAsRead}
            className="text-xs"
          >
            Mark all as read
          </Button>
        )}
      </div>
      <Separator />
      
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyNotifications />
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationItem 
                key={notification.id} 
                notification={notification} 
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
