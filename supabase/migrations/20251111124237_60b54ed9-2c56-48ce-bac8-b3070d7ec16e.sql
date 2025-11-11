-- Add invite code functionality to events table
ALTER TABLE events 
  ADD COLUMN IF NOT EXISTS invite_code VARCHAR(8) UNIQUE,
  ADD COLUMN IF NOT EXISTS allow_public_join BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_invite_code_at TIMESTAMP WITH TIME ZONE;

-- Generate codes for existing events
UPDATE events 
SET invite_code = UPPER(SUBSTRING(MD5(RANDOM()::text || id::text) FROM 1 FOR 8)),
    created_invite_code_at = NOW()
WHERE invite_code IS NULL;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_events_invite_code ON events(invite_code);

-- Add trigger to auto-generate invite codes for new events
CREATE OR REPLACE FUNCTION generate_event_invite_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := UPPER(SUBSTRING(MD5(RANDOM()::text || NEW.id::text) FROM 1 FOR 8));
    NEW.created_invite_code_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_event_invite_code ON events;
CREATE TRIGGER set_event_invite_code
  BEFORE INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION generate_event_invite_code();

-- Add comments for documentation
COMMENT ON COLUMN events.invite_code IS 'Unique 8-character code for sharing event via link';
COMMENT ON COLUMN events.allow_public_join IS 'Whether event allows public users to join via invite link';