-- Phase 1-5: Event System Improvements

-- Add RSVP deadline to events
ALTER TABLE events ADD COLUMN IF NOT EXISTS rsvp_deadline TIMESTAMPTZ;

-- Add team default venue settings
ALTER TABLE teams ADD COLUMN IF NOT EXISTS default_venue TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS default_venue_url TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS default_training_time TIME DEFAULT '19:00';
ALTER TABLE teams ADD COLUMN IF NOT EXISTS default_training_day INTEGER;

-- Create event templates table
CREATE TABLE IF NOT EXISTS event_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type event_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  default_time TIME DEFAULT '19:00',
  default_duration INTEGER DEFAULT 90,
  default_day_of_week INTEGER,
  max_participants INTEGER,
  is_public BOOLEAN DEFAULT false,
  match_format TEXT,
  meetup_category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on event_templates
ALTER TABLE event_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for event_templates
CREATE POLICY "Users can view their own templates"
  ON event_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view team templates"
  ON event_templates FOR SELECT
  USING (team_id IS NOT NULL AND is_team_member(auth.uid(), team_id));

CREATE POLICY "Users can create their own templates"
  ON event_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
  ON event_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
  ON event_templates FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger for event_templates
CREATE TRIGGER update_event_templates_updated_at
  BEFORE UPDATE ON event_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();