-- Fix 1: Update notifications type constraint to include event_attendance
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type = ANY (ARRAY[
  'team_invitation', 
  'new_follower', 
  'team_announcement', 
  'training_session', 
  'event_join_request', 
  'event_join_response', 
  'match_proposal', 
  'player_available',
  'event_attendance'
]));

-- Fix 2: Recreate notify_event_attendance with SECURITY DEFINER and exception handling
CREATE OR REPLACE FUNCTION public.notify_event_attendance()
RETURNS TRIGGER AS $$
DECLARE
  event_record RECORD;
  attendee_profile RECORD;
BEGIN
  IF NEW.status = 'attending' THEN
    SELECT id, title, created_by INTO event_record
    FROM events WHERE id = NEW.event_id;
    
    -- Don't notify if creator is the one attending
    IF event_record.created_by = NEW.user_id THEN
      RETURN NEW;
    END IF;
    
    SELECT display_name, username INTO attendee_profile
    FROM profiles WHERE user_id = NEW.user_id;
    
    INSERT INTO notifications (user_id, type, title, message, link, metadata)
    VALUES (
      event_record.created_by,
      'event_attendance',
      'New Attendee!',
      COALESCE(attendee_profile.display_name, attendee_profile.username, 'Someone') 
        || ' is attending "' || event_record.title || '"',
      '/events/' || event_record.id,
      jsonb_build_object(
        'event_id', event_record.id,
        'attendee_user_id', NEW.user_id,
        'attendee_name', COALESCE(attendee_profile.display_name, attendee_profile.username)
      )
    );
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'notify_event_attendance failed: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
   SECURITY DEFINER 
   SET search_path = public;

-- Fix 3: Recreate notify_event_join_request with SECURITY DEFINER and exception handling
CREATE OR REPLACE FUNCTION public.notify_event_join_request()
RETURNS TRIGGER AS $$
DECLARE
  event_record RECORD;
  requester_name TEXT;
BEGIN
  SELECT * INTO event_record FROM events WHERE id = NEW.event_id;
  SELECT COALESCE(display_name, username) INTO requester_name
    FROM profiles WHERE user_id = NEW.user_id;
  
  INSERT INTO notifications (user_id, type, title, message, link, metadata)
  VALUES (
    event_record.created_by,
    'event_join_request',
    'New Join Request',
    requester_name || ' wants to join ' || event_record.title,
    '/events/' || NEW.event_id,
    jsonb_build_object(
      'event_id', NEW.event_id,
      'request_id', NEW.id,
      'requester_id', NEW.user_id
    )
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'notify_event_join_request failed: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
   SECURITY DEFINER 
   SET search_path = public;

-- Ensure triggers exist
DROP TRIGGER IF EXISTS on_event_attendance_insert ON event_attendance;
CREATE TRIGGER on_event_attendance_insert
  AFTER INSERT ON event_attendance
  FOR EACH ROW
  EXECUTE FUNCTION notify_event_attendance();

DROP TRIGGER IF EXISTS on_event_join_request_insert ON event_join_requests;
CREATE TRIGGER on_event_join_request_insert
  AFTER INSERT ON event_join_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_event_join_request();