-- Create a view for users to see their own feedback WITHOUT admin_notes
CREATE OR REPLACE VIEW user_feedback_view AS
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
FROM feedback;

-- Grant select on the view to authenticated users
GRANT SELECT ON user_feedback_view TO authenticated;

-- Drop the policy that exposes admin_notes to users
DROP POLICY IF EXISTS "Users can view own feedback" ON public.feedback;