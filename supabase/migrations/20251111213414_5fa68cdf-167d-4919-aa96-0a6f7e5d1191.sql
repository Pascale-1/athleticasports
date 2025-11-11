-- Create a view that joins team_messages with profiles
CREATE OR REPLACE VIEW team_messages_with_profiles AS
SELECT 
  tm.*,
  p.username,
  p.display_name,
  p.avatar_url
FROM team_messages tm
LEFT JOIN profiles p ON p.user_id = tm.user_id;

-- Enable RLS on the view
ALTER VIEW team_messages_with_profiles SET (security_invoker = true);

-- Grant access to authenticated users
GRANT SELECT ON team_messages_with_profiles TO authenticated;