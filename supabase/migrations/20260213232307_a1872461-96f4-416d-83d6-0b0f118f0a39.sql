-- Allow authenticated users to join public teams
CREATE POLICY "Users can join public teams"
  ON public.team_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'active'
    AND EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_id
      AND teams.is_private = false
    )
  );

-- Allow self-assigning member role when joining public team
CREATE POLICY "Users can get member role on public team join"
  ON public.team_member_roles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN teams t ON t.id = tm.team_id
      WHERE tm.id = team_member_id
      AND tm.user_id = auth.uid()
      AND t.is_private = false
    )
    AND role = 'member'
  );