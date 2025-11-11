-- Add invite code and link joining settings to teams table
ALTER TABLE teams 
  ADD COLUMN invite_code VARCHAR(8) UNIQUE,
  ADD COLUMN allow_link_joining BOOLEAN DEFAULT true,
  ADD COLUMN created_invite_code_at TIMESTAMP WITH TIME ZONE;

-- Generate unique invite codes for existing teams
UPDATE teams 
SET invite_code = UPPER(SUBSTRING(MD5(RANDOM()::text || id::text) FROM 1 FOR 8)),
    created_invite_code_at = NOW()
WHERE invite_code IS NULL;

-- Create index for fast lookups
CREATE INDEX idx_teams_invite_code ON teams(invite_code);

-- Add trigger to auto-generate invite code for new teams
CREATE OR REPLACE FUNCTION generate_team_invite_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := UPPER(SUBSTRING(MD5(RANDOM()::text || NEW.id::text) FROM 1 FOR 8));
    NEW.created_invite_code_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER set_team_invite_code
  BEFORE INSERT ON teams
  FOR EACH ROW
  EXECUTE FUNCTION generate_team_invite_code();