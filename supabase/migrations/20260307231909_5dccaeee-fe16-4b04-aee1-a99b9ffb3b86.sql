-- Drop the overly restrictive profile SELECT policy
DROP POLICY IF EXISTS "Users can view accessible profiles" ON public.profiles;

-- Replace with a simpler policy: all authenticated users can view profiles
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);