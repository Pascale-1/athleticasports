import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface User {
  id?: string;
  user_id?: string;
  username?: string;
  display_name?: string;
  avatar_url?: string | null;
}

interface AvatarStackProps {
  users: User[];
  max?: number;
  size?: "xs" | "sm" | "md";
  className?: string;
  showCount?: boolean;
}

export const AvatarStack = ({
  users,
  max = 3,
  size = "sm",
  className,
  showCount = true,
}: AvatarStackProps) => {
  const displayUsers = users.slice(0, max);
  const remainingCount = users.length - max;
  
  const sizeClasses = {
    xs: "h-5 w-5 text-[8px]",
    sm: "h-6 w-6 text-[9px]",
    md: "h-8 w-8 text-[10px]",
  };
  
  const overlapClasses = {
    xs: "-ml-1.5",
    sm: "-ml-2",
    md: "-ml-2.5",
  };

  if (users.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex">
        {displayUsers.map((user, index) => (
          <Avatar
            key={user.id || user.user_id || index}
            className={cn(
              sizeClasses[size],
              "ring-2 ring-background shadow-sm transition-transform",
              index > 0 && overlapClasses[size]
            )}
          >
            <AvatarImage src={user.avatar_url || ""} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {(user.display_name || user.username || "?").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
        {showCount && remainingCount > 0 && (
          <div
            className={cn(
              sizeClasses[size],
              overlapClasses[size],
              "flex items-center justify-center rounded-full bg-muted/80 text-muted-foreground font-semibold ring-2 ring-background shadow-sm"
            )}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    </div>
  );
};
