CREATE OR REPLACE VIEW public.team_messages_with_profiles
WITH (security_invoker = true) AS
SELECT 
  tm.id,
  tm.team_id,
  tm.user_id,
  tm.content,
  tm.created_at,
  tm.updated_at,
  tm.is_edited,
  tm.replied_to_id,
  p.username,
  p.display_name,
  p.avatar_url
FROM team_messages tm
LEFT JOIN profiles_public p ON p.user_id = tm.user_id;