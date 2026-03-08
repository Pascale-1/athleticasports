import { useNotificationContext } from "@/contexts/NotificationContext";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { EmptyNotifications } from "@/components/notifications/EmptyNotifications";
import { PageContainer } from "@/components/mobile/PageContainer";
import { PageHeader } from "@/components/mobile/PageHeader";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const Notifications = () => {
  const { t } = useTranslation("common");
  const { notifications, loading, markAllAsRead } = useNotificationContext();

  return (
    <PageContainer>
      <PageHeader title={t("nav.notifications")} />
      <div className="px-4 pb-4">
        {notifications.length > 0 && (
          <div className="flex justify-end mb-2">
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
              {t("notifications.markAllRead")}
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyNotifications />
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border bg-card">
            {notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default Notifications;
