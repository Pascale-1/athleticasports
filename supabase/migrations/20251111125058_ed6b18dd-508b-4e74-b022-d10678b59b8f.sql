-- Update function to post announcements to BOTH teams for match events
CREATE OR REPLACE FUNCTION public.create_event_announcement()
RETURNS TRIGGER AS $$
DECLARE
  event_icon TEXT;
  event_type_label TEXT;
  event_time TEXT;
  announcement_content TEXT;
  location_text TEXT;
  opponent_text TEXT;
  opponent_announcement_content TEXT;
BEGIN
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

  -- Format event time
  event_time := to_char(NEW.start_time, 'Mon DD at HH24:MI');
  
  -- Build location text if provided
  location_text := CASE 
    WHEN NEW.location IS NOT NULL THEN E'\n📍 ' || NEW.location 
    ELSE '' 
  END;

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
    -- Get the home team name for opponent's announcement
    DECLARE
      home_team_name TEXT;
    BEGIN
      SELECT name INTO home_team_name FROM teams WHERE id = NEW.team_id;
      
      opponent_announcement_content := event_icon || ' **New ' || event_type_label || ': ' || NEW.title || '**' || E'\n\n' ||
        '🕐 ' || event_time || ' - ' || to_char(NEW.end_time, 'HH24:MI') ||
        location_text ||
        CASE WHEN home_team_name IS NOT NULL THEN E'\n🆚 ' || home_team_name ELSE '' END ||
        CASE WHEN NEW.description IS NOT NULL THEN E'\n\n' || NEW.description ELSE '' END ||
        E'\n\n_Check the Events tab to RSVP!_';

      -- Insert announcement for opponent team
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger remains the same
COMMENT ON FUNCTION public.create_event_announcement() 
  IS 'Automatically creates team announcements when events are created - posts to both teams for matches';