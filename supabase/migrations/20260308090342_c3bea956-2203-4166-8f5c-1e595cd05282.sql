DROP POLICY "Teams are viewable based on privacy" ON public.teams;
CREATE POLICY "Teams are viewable based on privacy" ON public.teams
  FOR SELECT USING (
    (NOT is_private) OR is_team_member(auth.uid(), id) OR (created_by = auth.uid())
  );