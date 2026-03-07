
-- Fix SELECT policy to include email-matched users
DROP POLICY "Team invitations viewable by team members" ON public.team_invitations;
CREATE POLICY "Team invitations viewable by relevant users"
ON public.team_invitations FOR SELECT TO authenticated
USING (
  is_team_member(auth.uid(), team_id)
  OR auth.uid() = invited_user_id
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Fix UPDATE policy to allow email-matched users to respond
DROP POLICY "Users can respond to their invitations" ON public.team_invitations;
CREATE POLICY "Users can respond to their invitations"
ON public.team_invitations FOR UPDATE TO authenticated
USING (
  auth.uid() = invited_user_id
  OR (
    invited_user_id IS NULL
    AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
)
WITH CHECK (
  auth.uid() = invited_user_id
  OR (
    invited_user_id IS NULL
    AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);
