-- Drop the existing constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add the updated constraint with event_join_response
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type = ANY (ARRAY[
  'team_invitation'::text, 
  'new_follower'::text, 
  'team_announcement'::text, 
  'training_session'::text,
  'event_join_request'::text,
  'event_join_response'::text
]));