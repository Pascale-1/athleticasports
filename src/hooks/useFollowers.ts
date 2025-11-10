import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  getFollowerCount,
  getFollowingCount,
  checkIsFollowing,
  followUser,
  unfollowUser,
} from "@/lib/followers";
import { useToast } from "@/hooks/use-toast";

export const useFollowers = (userId: string | null) => {
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  const fetchCounts = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const [followers, following, following_status] = await Promise.all([
        getFollowerCount(userId),
        getFollowingCount(userId),
        checkIsFollowing(userId),
      ]);

      setFollowerCount(followers);
      setFollowingCount(following);
      setIsFollowing(following_status);
    } catch (error) {
      console.error("Error fetching follower data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, [userId]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`follower-changes-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "followers",
          filter: `following_id=eq.${userId}`,
        },
        () => {
          fetchCounts();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "followers",
          filter: `follower_id=eq.${userId}`,
        },
        () => {
          fetchCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const follow = async () => {
    if (!userId || actionLoading) return;

    setActionLoading(true);
    const previousFollowing = isFollowing;
    const previousCount = followerCount;

    // Optimistic update
    setIsFollowing(true);
    setFollowerCount(prev => prev + 1);

    try {
      await followUser(userId);
      toast({
        title: "Success",
        description: "You are now following this user",
      });
    } catch (error) {
      // Revert on error
      setIsFollowing(previousFollowing);
      setFollowerCount(previousCount);
      toast({
        title: "Error",
        description: "Failed to follow user. Please try again.",
        variant: "destructive",
      });
      console.error("Error following user:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const unfollow = async () => {
    if (!userId || actionLoading) return;

    setActionLoading(true);
    const previousFollowing = isFollowing;
    const previousCount = followerCount;

    // Optimistic update
    setIsFollowing(false);
    setFollowerCount(prev => Math.max(0, prev - 1));

    try {
      await unfollowUser(userId);
      toast({
        title: "Success",
        description: "You have unfollowed this user",
      });
    } catch (error) {
      // Revert on error
      setIsFollowing(previousFollowing);
      setFollowerCount(previousCount);
      toast({
        title: "Error",
        description: "Failed to unfollow user. Please try again.",
        variant: "destructive",
      });
      console.error("Error unfollowing user:", error);
    } finally {
      setActionLoading(false);
    }
  };

  return {
    followerCount,
    followingCount,
    isFollowing,
    loading,
    actionLoading,
    follow,
    unfollow,
  };
};
