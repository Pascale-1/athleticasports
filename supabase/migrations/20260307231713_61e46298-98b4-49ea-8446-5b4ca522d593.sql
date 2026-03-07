-- Step 1: Create SECURITY DEFINER function to safely get current user's email
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email::text FROM auth.users WHERE id = auth.uid();
$$;

-- Step 2: Drop and recreate SELECT policy
DROP POLICY IF EXISTS "Team invitations viewable by relevant users" ON public.team_invitations;
CREATE POLICY "Team invitations viewable by relevant users"
ON public.team_invitations
FOR SELECT
TO authenticated
USING (
  is_team_member(auth.uid(), team_id)
  OR auth.uid() = invited_user_id
  OR email = public.get_current_user_email()
);

-- Step 3: Drop and recreate UPDATE policy
DROP POLICY IF EXISTS "Users can respond to their invitations" ON public.team_invitations;
CREATE POLICY "Users can respond to their invitations"
ON public.team_invitations
FOR UPDATE
TO authenticated
USING (
  auth.uid() = invited_user_id
  OR (invited_user_id IS NULL AND email = public.get_current_user_email())
)
WITH CHECK (
  auth.uid() = invited_user_id
  OR (invited_user_id IS NULL AND email = public.get_current_user_email())
);