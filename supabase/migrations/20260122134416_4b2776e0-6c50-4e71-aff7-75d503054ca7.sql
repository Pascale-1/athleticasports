-- Add columns to link recurring occurrences to parent event
ALTER TABLE events ADD COLUMN IF NOT EXISTS parent_event_id UUID REFERENCES events(id) ON DELETE CASCADE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS occurrence_index INTEGER DEFAULT NULL;

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_events_parent_id ON events(parent_event_id);

-- Function to generate recurring occurrences automatically
CREATE OR REPLACE FUNCTION generate_recurring_occurrences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  freq TEXT;
  until_date TIMESTAMPTZ;
  current_occurrence TIMESTAMPTZ;
  end_date TIMESTAMPTZ;
  occurrence_count INTEGER := 0;
  max_weeks INTEGER := 8;
  interval_value INTERVAL;
  duration INTERVAL;
BEGIN
  -- Only process if this is a new recurring event (not a generated occurrence)
  IF NOT NEW.is_recurring OR NEW.parent_event_id IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  -- Skip if no recurrence rule
  IF NEW.recurrence_rule IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Extract frequency from RRULE
  freq := substring(NEW.recurrence_rule FROM 'FREQ=([A-Z]+)');
  
  -- Determine interval based on frequency
  interval_value := CASE freq
    WHEN 'DAILY' THEN INTERVAL '1 day'
    WHEN 'WEEKLY' THEN INTERVAL '1 week'
    WHEN 'MONTHLY' THEN INTERVAL '1 month'
    WHEN 'YEARLY' THEN INTERVAL '1 year'
    ELSE INTERVAL '1 week'
  END;
  
  -- Extract UNTIL date if present, otherwise use 8 weeks from now
  IF NEW.recurrence_rule LIKE '%UNTIL=%' THEN
    BEGIN
      until_date := to_timestamp(
        substring(NEW.recurrence_rule FROM 'UNTIL=([0-9T]+)'),
        'YYYYMMDD"T"HH24MISS'
      );
    EXCEPTION WHEN OTHERS THEN
      until_date := NOW() + (max_weeks * INTERVAL '1 week');
    END;
  ELSE
    until_date := NOW() + (max_weeks * INTERVAL '1 week');
  END IF;
  
  -- Cap at 8 weeks regardless
  end_date := LEAST(until_date, NOW() + (max_weeks * INTERVAL '1 week'));
  
  -- Calculate event duration
  duration := NEW.end_time - NEW.start_time;
  
  -- Generate occurrences (skip the first one as it's the parent)
  current_occurrence := NEW.start_time + interval_value;
  
  WHILE current_occurrence <= end_date LOOP
    occurrence_count := occurrence_count + 1;
    
    INSERT INTO events (
      team_id, type, title, description, location, location_type, location_url,
      start_time, end_time, max_participants, is_public, is_recurring,
      recurrence_rule, opponent_name, opponent_logo_url, match_format,
      home_away, meetup_category, created_by, parent_event_id, occurrence_index,
      opponent_team_id, allow_public_join, looking_for_players, players_needed
    ) VALUES (
      NEW.team_id, NEW.type, NEW.title, NEW.description, NEW.location,
      NEW.location_type, NEW.location_url, current_occurrence, current_occurrence + duration,
      NEW.max_participants, NEW.is_public, FALSE,
      NULL, NEW.opponent_name, NEW.opponent_logo_url, NEW.match_format,
      NEW.home_away, NEW.meetup_category, NEW.created_by, NEW.id, occurrence_count,
      NEW.opponent_team_id, NEW.allow_public_join, NEW.looking_for_players, NEW.players_needed
    );
    
    current_occurrence := current_occurrence + interval_value;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger (fires AFTER insert so NEW.id is available)
DROP TRIGGER IF EXISTS trigger_generate_recurring_occurrences ON events;
CREATE TRIGGER trigger_generate_recurring_occurrences
  AFTER INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION generate_recurring_occurrences();

-- Update notify_new_event to skip child occurrences and improve recurring event messaging
CREATE OR REPLACE FUNCTION notify_new_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  member RECORD;
  team_name TEXT;
  creator_name TEXT;
  event_time TEXT;
  event_icon TEXT;
  notification_title TEXT;
BEGIN
  -- Skip notifications for auto-generated occurrences (they have parent_event_id)
  IF NEW.parent_event_id IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  event_icon := CASE NEW.type
    WHEN 'training' THEN '🏋️'
    WHEN 'match' THEN '⚽'
    WHEN 'meetup' THEN '👥'
    ELSE '📅'
  END;
  
  SELECT COALESCE(display_name, username) INTO creator_name
  FROM profiles WHERE user_id = NEW.created_by;
  
  event_time := to_char(NEW.start_time, 'Mon DD at HH24:MI');
  
  -- For recurring events, mention it's a series
  IF NEW.is_recurring THEN
    notification_title := 'New Recurring ' || initcap(NEW.type::text);
  ELSE
    notification_title := 'New ' || initcap(NEW.type::text) || ' Event';
  END IF;
  
  IF NEW.team_id IS NOT NULL THEN
    SELECT name INTO team_name FROM teams WHERE id = NEW.team_id;
    
    FOR member IN 
      SELECT user_id FROM team_members 
      WHERE team_id = NEW.team_id 
        AND status = 'active'
        AND user_id != NEW.created_by
    LOOP
      INSERT INTO notifications (user_id, type, title, message, link, metadata)
      VALUES (
        member.user_id,
        'training_session',
        notification_title,
        event_icon || ' ' || team_name || ': ' || NEW.title || ' starts ' || event_time,
        '/events/' || NEW.id,
        jsonb_build_object('team_id', NEW.team_id, 'event_id', NEW.id, 'event_type', NEW.type, 'is_recurring', NEW.is_recurring)
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update create_event_announcement to skip child occurrences
CREATE OR REPLACE FUNCTION create_event_announcement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  event_icon TEXT;
  event_type_label TEXT;
  event_time TEXT;
  announcement_content TEXT;
  location_text TEXT;
  opponent_text TEXT;
  recurrence_text TEXT;
  opponent_announcement_content TEXT;
BEGIN
  -- Skip announcements for auto-generated occurrences
  IF NEW.parent_event_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Determine event icon and label based on type
  event_icon := CASE NEW.type
    WHEN 'training' THEN '🏋️'
    WHEN 'match' THEN '⚽'
    WHEN 'meetup' THEN '👥'
    ELSE '📅'
  END;

  event_type_label := CASE NEW.type
    WHEN 'training' THEN 'Training Session'
    WHEN 'match' THEN 'Match'
    WHEN 'meetup' THEN 'Meetup'
    ELSE 'Event'
  END;

  -- Add recurring label if applicable
  IF NEW.is_recurring THEN
    event_type_label := 'Recurring ' || event_type_label;
  END IF;

  -- Format event time
  event_time := to_char(NEW.start_time, 'Mon DD at HH24:MI');
  
  -- Build location text if provided
  location_text := CASE 
    WHEN NEW.location IS NOT NULL THEN E'\n📍 ' || NEW.location 
    ELSE '' 
  END;

  -- Build recurrence text
  recurrence_text := '';
  IF NEW.is_recurring AND NEW.recurrence_rule IS NOT NULL THEN
    recurrence_text := E'\n🔄 ' || CASE 
      WHEN NEW.recurrence_rule LIKE '%FREQ=DAILY%' THEN 'Repeats daily'
      WHEN NEW.recurrence_rule LIKE '%FREQ=WEEKLY%' THEN 'Repeats weekly'
      WHEN NEW.recurrence_rule LIKE '%FREQ=MONTHLY%' THEN 'Repeats monthly'
      ELSE 'Recurring event'
    END;
  END IF;

  -- Create announcement for HOME TEAM (team_id)
  IF NEW.team_id IS NOT NULL THEN
    -- Build opponent text for matches
    opponent_text := CASE 
      WHEN NEW.type = 'match' AND NEW.opponent_name IS NOT NULL 
      THEN E'\n🆚 ' || NEW.opponent_name
      WHEN NEW.type = 'match' AND NEW.opponent_team_id IS NOT NULL
      THEN E'\n🆚 Opponent Team'
      ELSE '' 
    END;

    -- Build announcement content
    announcement_content := event_icon || ' **New ' || event_type_label || ': ' || NEW.title || '**' || E'\n\n' ||
      '🕐 ' || event_time || ' - ' || to_char(NEW.end_time, 'HH24:MI') ||
      location_text ||
      opponent_text ||
      recurrence_text ||
      CASE WHEN NEW.description IS NOT NULL THEN E'\n\n' || NEW.description ELSE '' END ||
      E'\n\n_Check the Events tab to RSVP!_';

    -- Insert announcement for home team
    INSERT INTO team_announcements (team_id, posted_by, content, is_pinned)
    VALUES (
      NEW.team_id,
      NEW.created_by,
      announcement_content,
      false
    );
  END IF;

  -- Create announcement for OPPONENT TEAM (opponent_team_id) if this is a match
  IF NEW.type = 'match' AND NEW.opponent_team_id IS NOT NULL THEN
    DECLARE
      home_team_name TEXT;
    BEGIN
      SELECT name INTO home_team_name FROM teams WHERE id = NEW.team_id;
      
      opponent_announcement_content := event_icon || ' **New ' || event_type_label || ': ' || NEW.title || '**' || E'\n\n' ||
        '🕐 ' || event_time || ' - ' || to_char(NEW.end_time, 'HH24:MI') ||
        location_text ||
        CASE WHEN home_team_name IS NOT NULL THEN E'\n🆚 ' || home_team_name ELSE '' END ||
        recurrence_text ||
        CASE WHEN NEW.description IS NOT NULL THEN E'\n\n' || NEW.description ELSE '' END ||
        E'\n\n_Check the Events tab to RSVP!_';

      INSERT INTO team_announcements (team_id, posted_by, content, is_pinned)
      VALUES (
        NEW.opponent_team_id,
        NEW.created_by,
        opponent_announcement_content,
        false
      );
    END;
  END IF;
  
  RETURN NEW;
END;
$$;