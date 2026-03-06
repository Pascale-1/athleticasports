CREATE OR REPLACE FUNCTION public.get_team_info_for_invitation(_team_id uuid, _user_id uuid)
RETURNS TABLE(id uuid, name text, sport text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.id, t.name, t.sport, t.avatar_url
  FROM public.teams t
  WHERE t.id = _team_id
    AND (
      NOT t.is_private
      OR is_team_member(_user_id, t.id)
      OR EXISTS (
        SELECT 1 FROM public.team_invitations ti
        WHERE ti.team_id = t.id
          AND ti.status = 'pending'
          AND ti.expires_at > now()
          AND (ti.invited_user_id = _user_id OR ti.email = (SELECT email FROM auth.users WHERE auth.users.id = _user_id))
      )
    );
$$;