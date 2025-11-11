-- Add opponent_team_id column to events table
ALTER TABLE events 
  ADD COLUMN opponent_team_id uuid 
  REFERENCES teams(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX idx_events_opponent_team_id 
  ON events(opponent_team_id);

-- Add comment for clarity
COMMENT ON COLUMN events.opponent_team_id IS 
  'Reference to opponent team (away team) for match events';