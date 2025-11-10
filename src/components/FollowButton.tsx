import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { useFollowers } from "@/hooks/useFollowers";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface FollowButtonProps {
  userId: string;
  username?: string;
}

export const FollowButton = ({ userId, username }: FollowButtonProps) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { isFollowing, actionLoading, follow, unfollow } = useFollowers(userId);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    fetchCurrentUser();
  }, []);

  // Don't show button for own profile
  if (currentUserId === userId) return null;

  const handleClick = () => {
    if (isFollowing) {
      unfollow();
    } else {
      follow();
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={actionLoading}
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      className="min-w-[100px]"
    >
      {actionLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{isFollowing ? "Unfollowing..." : "Following..."}</span>
        </>
      ) : isFollowing ? (
        <>
          <UserCheck className="h-4 w-4" />
          <span>Following</span>
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          <span>Follow</span>
        </>
      )}
    </Button>
  );
};
