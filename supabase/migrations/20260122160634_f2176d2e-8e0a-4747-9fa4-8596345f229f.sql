-- Drop the existing constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add the updated constraint with the new event_join_request type
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type = ANY (ARRAY[
  'team_invitation'::text, 
  'new_follower'::text, 
  'team_announcement'::text, 
  'training_session'::text,
  'event_join_request'::text
]));