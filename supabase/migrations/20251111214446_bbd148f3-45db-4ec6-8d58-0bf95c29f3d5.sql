-- Fix security warnings: Add SET search_path = public to functions missing it

-- Fix log_team_created function
CREATE OR REPLACE FUNCTION public.log_team_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Fix log_team_joined function
CREATE OR REPLACE FUNCTION public.log_team_joined()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Fix log_event_created function
CREATE OR REPLACE FUNCTION public.log_event_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Fix log_event_rsvp function
CREATE OR REPLACE FUNCTION public.log_event_rsvp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Fix log_activity_logged function
CREATE OR REPLACE FUNCTION public.log_activity_logged()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;