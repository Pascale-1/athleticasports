import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  getFollowerCount,
  getFollowingCount,
  checkIsFollowing,
  followUser,
  unfollowUser,
} from "@/lib/followers";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeSubscription } from "@/lib/realtimeManager";

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

  // Use ref to store fetchCounts for stable callback
  const fetchCountsRef = useRef(fetchCounts);
  fetchCountsRef.current = fetchCounts;

  // Realtime subscription using centralized manager
  const handleRealtimeChange = useCallback(() => {
    fetchCountsRef.current();
  }, []);

  useRealtimeSubscription(
    `follower-changes-${userId}`,
    [
      { table: "followers", event: "*", filter: `following_id=eq.${userId}` },
      { table: "followers", event: "*", filter: `follower_id=eq.${userId}` },
    ],
    handleRealtimeChange,
    !!userId
  );

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
