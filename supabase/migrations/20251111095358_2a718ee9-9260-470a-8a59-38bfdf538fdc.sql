-- Add sport column to teams table for categorization
ALTER TABLE teams 
ADD COLUMN sport text;

-- Add index for better query performance when filtering by sport
CREATE INDEX idx_teams_sport ON teams(sport);

-- Set a default sport for existing teams (optional, can be updated later)
UPDATE teams 
SET sport = 'General' 
WHERE sport IS NULL;