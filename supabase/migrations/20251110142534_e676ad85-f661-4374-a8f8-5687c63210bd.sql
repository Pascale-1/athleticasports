-- Create followers table
CREATE TABLE public.followers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Create indexes for performance
CREATE INDEX idx_followers_follower_id ON public.followers(follower_id);
CREATE INDEX idx_followers_following_id ON public.followers(following_id);
CREATE INDEX idx_followers_created_at ON public.followers(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Followers are viewable by everyone"
  ON public.followers
  FOR SELECT
  USING (true);

CREATE POLICY "Users can follow others"
  ON public.followers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON public.followers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- Function to get follower count
CREATE OR REPLACE FUNCTION public.get_follower_count(profile_user_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)
  FROM public.followers
  WHERE following_id = profile_user_id;
$$;

-- Function to get following count
CREATE OR REPLACE FUNCTION public.get_following_count(profile_user_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)
  FROM public.followers
  WHERE follower_id = profile_user_id;
$$;

-- Function to check if user is following another user
CREATE OR REPLACE FUNCTION public.is_following(current_user_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.followers
    WHERE follower_id = current_user_id
      AND following_id = target_user_id
  );
$$;

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.followers;