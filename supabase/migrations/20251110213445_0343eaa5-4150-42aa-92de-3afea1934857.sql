-- Drop the public policy on profiles table
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create new policy that restricts profile viewing to authenticated users only
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles
FOR SELECT 
TO authenticated
USING (true);