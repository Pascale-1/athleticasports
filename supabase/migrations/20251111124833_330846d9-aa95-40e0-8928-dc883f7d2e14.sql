-- Create function to automatically post announcements for all event types
CREATE OR REPLACE FUNCTION public.create_event_announcement()
RETURNS TRIGGER AS $$
DECLARE
  event_icon TEXT;
  event_type_label TEXT;
  event_time TEXT;
  announcement_content TEXT;
  location_text TEXT;
  opponent_text TEXT;
BEGIN
  -- Only create announcements for team events
  IF NEW.team_id IS NULL THEN
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

  -- Format event time
  event_time := to_char(NEW.start_time, 'Mon DD at HH24:MI');
  
  -- Build location text if provided
  location_text := CASE 
    WHEN NEW.location IS NOT NULL THEN E'\n📍 ' || NEW.location 
    ELSE '' 
  END;

  -- Build opponent text for matches
  opponent_text := CASE 
    WHEN NEW.type = 'match' AND NEW.opponent_name IS NOT NULL 
    THEN E'\n🆚 ' || NEW.opponent_name
    ELSE '' 
  END;

  -- Build announcement content
  announcement_content := event_icon || ' **New ' || event_type_label || ': ' || NEW.title || '**' || E'\n\n' ||
    '🕐 ' || event_time || ' - ' || to_char(NEW.end_time, 'HH24:MI') ||
    location_text ||
    opponent_text ||
    CASE WHEN NEW.description IS NOT NULL THEN E'\n\n' || NEW.description ELSE '' END ||
    E'\n\n_Check the Events tab to RSVP!_';

  -- Insert announcement
  INSERT INTO team_announcements (team_id, posted_by, content, is_pinned)
  VALUES (
    NEW.team_id,
    NEW.created_by,
    announcement_content,
    false
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to fire on event creation
DROP TRIGGER IF EXISTS create_announcement_on_event ON events;
CREATE TRIGGER create_announcement_on_event
  AFTER INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION public.create_event_announcement();

-- Add comment
COMMENT ON FUNCTION public.create_event_announcement() 
  IS 'Automatically creates team announcements when events are created';