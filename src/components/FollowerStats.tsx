import { Users, UserPlus } from "lucide-react";
import { useFollowers } from "@/hooks/useFollowers";

interface FollowerStatsProps {
  userId: string;
}

export const FollowerStats = ({ userId }: FollowerStatsProps) => {
  const { followerCount, followingCount, loading } = useFollowers(userId);

  if (loading) {
    return (
      <div className="flex gap-6 justify-center py-4 animate-pulse">
        <div className="h-5 w-24 bg-muted rounded"></div>
        <div className="h-5 w-24 bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 justify-center py-4 text-sm">
      <div className="flex items-center gap-2 text-foreground">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="font-semibold">{followerCount}</span>
        <span className="text-muted-foreground">
          {followerCount === 1 ? "Follower" : "Followers"}
        </span>
      </div>
      <div className="flex items-center gap-2 text-foreground">
        <UserPlus className="h-4 w-4 text-muted-foreground" />
        <span className="font-semibold">{followingCount}</span>
        <span className="text-muted-foreground">Following</span>
      </div>
    </div>
  );
};
