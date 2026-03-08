
-- Create profiles_public view (excludes email column)
CREATE OR REPLACE VIEW public.profiles_public 
WITH (security_invoker = true) AS
SELECT 
  id,
  user_id,
  username,
  display_name,
  avatar_url,
  bio,
  full_name,
  primary_sport,
  team_name,
  preferred_district,
  is_founding_member,
  onboarding_completed,
  created_at,
  updated_at
FROM public.profiles;

-- Grant access to authenticated and anon roles
GRANT SELECT ON public.profiles_public TO authenticated;
GRANT SELECT ON public.profiles_public TO anon;

-- Drop the existing overly-permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- New policy: users can only read their own full profile (includes email)
CREATE POLICY "Users can view own full profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);
