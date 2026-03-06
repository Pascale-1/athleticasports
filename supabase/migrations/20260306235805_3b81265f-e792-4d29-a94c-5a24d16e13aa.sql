CREATE OR REPLACE FUNCTION public.create_event_announcement()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  IF NEW.parent_event_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

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

  IF NEW.is_recurring THEN
    event_type_label := 'Recurring ' || event_type_label;
  END IF;

  event_time := to_char(NEW.start_time, 'Mon DD at HH24:MI');
  
  location_text := CASE 
    WHEN NEW.location IS NOT NULL THEN E'\n📍 ' || NEW.location 
    ELSE '' 
  END;

  recurrence_text := '';
  IF NEW.is_recurring AND NEW.recurrence_rule IS NOT NULL THEN
    recurrence_text := E'\n🔄 ' || CASE 
      WHEN NEW.recurrence_rule LIKE '%FREQ=DAILY%' THEN 'Repeats daily'
      WHEN NEW.recurrence_rule LIKE '%FREQ=WEEKLY%' THEN 'Repeats weekly'
      WHEN NEW.recurrence_rule LIKE '%FREQ=MONTHLY%' THEN 'Repeats monthly'
      ELSE 'Recurring event'
    END;
  END IF;

  IF NEW.team_id IS NOT NULL THEN
    opponent_text := CASE 
      WHEN NEW.type = 'match' AND NEW.opponent_name IS NOT NULL 
      THEN E'\n🆚 ' || NEW.opponent_name
      WHEN NEW.type = 'match' AND NEW.opponent_team_id IS NOT NULL
      THEN E'\n🆚 Opponent Team'
      ELSE '' 
    END;

    announcement_content := event_icon || ' **New ' || event_type_label || ': ' || NEW.title || '**' || E'\n\n' ||
      '🕐 ' || event_time || ' - ' || to_char(NEW.end_time, 'HH24:MI') ||
      location_text ||
      opponent_text ||
      recurrence_text ||
      CASE WHEN NEW.description IS NOT NULL THEN E'\n\n' || NEW.description ELSE '' END ||
      E'\n\n_Tap to view details and RSVP_';

    INSERT INTO team_announcements (team_id, posted_by, content, is_pinned, event_id)
    VALUES (
      NEW.team_id,
      NEW.created_by,
      announcement_content,
      false,
      NEW.id
    );
  END IF;

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
        E'\n\n_Tap to view details and RSVP_';

      INSERT INTO team_announcements (team_id, posted_by, content, is_pinned, event_id)
      VALUES (
        NEW.opponent_team_id,
        NEW.created_by,
        opponent_announcement_content,
        false,
        NEW.id
      );
    END;
  END IF;
  
  RETURN NEW;
END;
$function$;