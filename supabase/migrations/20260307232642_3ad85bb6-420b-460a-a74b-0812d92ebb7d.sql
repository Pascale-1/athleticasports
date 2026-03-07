CREATE POLICY "Team admins can update invitations"
ON public.team_invitations
FOR UPDATE
USING (can_manage_team(auth.uid(), team_id) OR (auth.uid() = invited_by))
WITH CHECK (can_manage_team(auth.uid(), team_id) OR (auth.uid() = invited_by));