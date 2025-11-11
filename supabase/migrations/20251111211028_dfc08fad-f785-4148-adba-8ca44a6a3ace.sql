-- Create user_activity_log table for comprehensive action tracking
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'team_created',
    'team_joined',
    'event_created',
    'event_rsvp',
    'activity_logged',
    'goal_completed',
    'achievement_unlocked'
  )),
  entity_id UUID,
  entity_type TEXT CHECK (entity_type IN ('team', 'event', 'activity', 'goal')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_action_type ON user_activity_log(action_type);

-- Enable RLS
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view activity from followed users and teammates
CREATE POLICY "Users can view relevant activity logs"
  ON user_activity_log FOR SELECT
  USING (
    user_id = auth.uid() 
    OR 
    EXISTS (
      SELECT 1 FROM followers 
      WHERE follower_id = auth.uid() 
      AND following_id = user_activity_log.user_id
    )
    OR
    EXISTS (
      SELECT 1 FROM team_members tm1
      JOIN team_members tm2 ON tm1.team_id = tm2.team_id
      WHERE tm1.user_id = auth.uid() 
      AND tm2.user_id = user_activity_log.user_id
      AND tm1.status = 'active'
      AND tm2.status = 'active'
    )
  );

-- RLS Policy: Users can insert their own logs
CREATE POLICY "Users can insert their own activity logs"
  ON user_activity_log FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Trigger Function: Log team creation
CREATE OR REPLACE FUNCTION log_team_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_activity_log (user_id, action_type, entity_id, entity_type, metadata)
  VALUES (
    NEW.created_by,
    'team_created',
    NEW.id,
    'team',
    jsonb_build_object(
      'team_name', NEW.name,
      'sport', NEW.sport,
      'is_private', NEW.is_private
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER team_created_activity_trigger
AFTER INSERT ON teams
FOR EACH ROW
EXECUTE FUNCTION log_team_created();

-- Trigger Function: Log team joining
CREATE OR REPLACE FUNCTION log_team_joined()
RETURNS TRIGGER AS $$
DECLARE
  team_name TEXT;
BEGIN
  IF NEW.status = 'active' THEN
    SELECT name INTO team_name FROM teams WHERE id = NEW.team_id;
    
    INSERT INTO user_activity_log (user_id, action_type, entity_id, entity_type, metadata)
    VALUES (
      NEW.user_id,
      'team_joined',
      NEW.team_id,
      'team',
      jsonb_build_object('team_name', team_name, 'team_id', NEW.team_id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER team_joined_activity_trigger
AFTER INSERT ON team_members
FOR EACH ROW
EXECUTE FUNCTION log_team_joined();

-- Trigger Function: Log event creation
CREATE OR REPLACE FUNCTION log_event_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_activity_log (user_id, action_type, entity_id, entity_type, metadata)
  VALUES (
    NEW.created_by,
    'event_created',
    NEW.id,
    'event',
    jsonb_build_object(
      'event_title', NEW.title,
      'event_type', NEW.type,
      'start_time', NEW.start_time,
      'location', NEW.location
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER event_created_activity_trigger
AFTER INSERT ON events
FOR EACH ROW
EXECUTE FUNCTION log_event_created();

-- Trigger Function: Log event RSVP
CREATE OR REPLACE FUNCTION log_event_rsvp()
RETURNS TRIGGER AS $$
DECLARE
  event_title TEXT;
BEGIN
  IF NEW.status = 'attending' THEN
    SELECT title INTO event_title FROM events WHERE id = NEW.event_id;
    
    INSERT INTO user_activity_log (user_id, action_type, entity_id, entity_type, metadata)
    VALUES (
      NEW.user_id,
      'event_rsvp',
      NEW.event_id,
      'event',
      jsonb_build_object(
        'event_title', event_title,
        'event_id', NEW.event_id,
        'status', NEW.status
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER event_rsvp_activity_trigger
AFTER INSERT OR UPDATE ON event_attendance
FOR EACH ROW
EXECUTE FUNCTION log_event_rsvp();

-- Trigger Function: Log activity logging
CREATE OR REPLACE FUNCTION log_activity_logged()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_activity_log (user_id, action_type, entity_id, entity_type, metadata)
  VALUES (
    NEW.user_id,
    'activity_logged',
    NEW.id,
    'activity',
    jsonb_build_object(
      'activity_type', NEW.type,
      'title', NEW.title,
      'distance', NEW.distance,
      'duration', NEW.duration
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER activity_logged_activity_trigger
AFTER INSERT ON activities
FOR EACH ROW
EXECUTE FUNCTION log_activity_logged();