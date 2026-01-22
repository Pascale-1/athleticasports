-- Drop the overly permissive policy that exposes all profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Create a more restrictive policy that only allows viewing:
-- 1. Own profile
-- 2. Profiles of users they follow
-- 3. Profiles of users in their teams
-- 4. Profiles of users in public events they attend
CREATE POLICY "Users can view accessible profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = user_id  -- Own profile
    OR EXISTS (  -- Following relationship
      SELECT 1 FROM followers 
      WHERE follower_id = auth.uid() 
      AND following_id = profiles.user_id
    )
    OR EXISTS (  -- Same team member
      SELECT 1 FROM team_members tm1
      JOIN team_members tm2 ON tm1.team_id = tm2.team_id
      WHERE tm1.user_id = auth.uid()
      AND tm2.user_id = profiles.user_id
      AND tm1.status = 'active'
      AND tm2.status = 'active'
    )
    OR EXISTS (  -- Same public event attendee
      SELECT 1 FROM event_attendance ea1
      JOIN event_attendance ea2 ON ea1.event_id = ea2.event_id
      JOIN events e ON e.id = ea1.event_id
      WHERE ea1.user_id = auth.uid()
      AND ea2.user_id = profiles.user_id
      AND e.is_public = true
    )
  );