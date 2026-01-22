-- Add sport column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS sport text;

-- Backfill existing match events from their team's sport
UPDATE events e
SET sport = t.sport
FROM teams t
WHERE e.team_id = t.id 
  AND e.type = 'match' 
  AND e.sport IS NULL
  AND t.sport IS NOT NULL;

-- Drop old notification type constraint if exists
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add updated notification type constraint including match_proposal
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type = ANY (ARRAY[
  'team_invitation'::text, 
  'new_follower'::text, 
  'team_announcement'::text, 
  'training_session'::text, 
  'event_join_request'::text, 
  'event_join_response'::text,
  'match_proposal'::text,
  'player_available'::text
]));