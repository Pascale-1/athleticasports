import { Bell } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export const EmptyNotifications = () => {
  return (
    <EmptyState
      icon={Bell}
      title="No notifications yet"
      description="We'll notify you when something happens"
      emoji="🔔"
    />
  );
};
