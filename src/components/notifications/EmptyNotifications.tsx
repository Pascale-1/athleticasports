import { Bell } from "lucide-react";

export const EmptyNotifications = () => {
  return (
    <div className="flex flex-col items-center justify-center h-40 text-center p-4">
      <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
      <p className="text-sm font-medium text-muted-foreground">No notifications yet</p>
      <p className="text-xs text-muted-foreground mt-1">
        We'll notify you when something happens
      </p>
    </div>
  );
};
