CREATE POLICY "Users can view own team memberships"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);