
DROP POLICY IF EXISTS "Users can join public teams" ON public.team_members;
CREATE POLICY "Users can join public teams"
  ON public.team_members FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'active'
    AND EXISTS (SELECT 1 FROM teams WHERE teams.id = team_members.team_id AND teams.is_private = false)
  );

DROP POLICY IF EXISTS "Users can get member role on public team join" ON public.team_member_roles;
CREATE POLICY "Users can get member role on public team join"
  ON public.team_member_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN teams t ON t.id = tm.team_id
      WHERE tm.id = team_member_roles.team_member_id
      AND tm.user_id = auth.uid()
      AND t.is_private = false
    )
    AND role = 'member'
  );
