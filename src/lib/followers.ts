import { supabase } from "@/integrations/supabase/client";

export const followUser = async (followingId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("followers")
    .insert({
      follower_id: user.id,
      following_id: followingId,
    });

  if (error) throw error;
};

export const unfollowUser = async (followingId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("followers")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", followingId);

  if (error) throw error;
};

export const getFollowerCount = async (userId: string): Promise<number> => {
  const { data, error } = await supabase.rpc("get_follower_count", {
    profile_user_id: userId,
  });

  if (error) throw error;
  return data || 0;
};

export const getFollowingCount = async (userId: string): Promise<number> => {
  const { data, error } = await supabase.rpc("get_following_count", {
    profile_user_id: userId,
  });

  if (error) throw error;
  return data || 0;
};

export const checkIsFollowing = async (targetUserId: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase.rpc("is_following", {
    current_user_id: user.id,
    target_user_id: targetUserId,
  });

  if (error) throw error;
  return data || false;
};
