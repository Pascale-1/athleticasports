-- Drop and recreate view with SECURITY INVOKER (default, which respects querying user's RLS)
DROP VIEW IF EXISTS user_feedback_view;

CREATE VIEW user_feedback_view 
WITH (security_invoker = true)
AS
SELECT 
  id, 
  user_id, 
  category, 
  message, 
  page_url,
  user_agent, 
  status, 
  created_at
  -- admin_notes intentionally omitted for security
FROM feedback
WHERE user_id = auth.uid();

-- Grant select on the view to authenticated users
GRANT SELECT ON user_feedback_view TO authenticated;