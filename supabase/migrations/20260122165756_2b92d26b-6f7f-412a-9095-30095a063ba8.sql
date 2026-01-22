-- Function to notify event creator when someone RSVPs "attending"
CREATE OR REPLACE FUNCTION public.notify_event_attendance()
RETURNS TRIGGER AS $$
DECLARE
  event_record RECORD;
  attendee_profile RECORD;
BEGIN
  -- Only notify on new attendance with 'attending' status
  IF NEW.status = 'attending' THEN
    -- Get event details
    SELECT id, title, created_by INTO event_record
    FROM events
    WHERE id = NEW.event_id;
    
    -- Don't notify if creator is the one attending (they auto-attend their own events)
    IF event_record.created_by = NEW.user_id THEN
      RETURN NEW;
    END IF;
    
    -- Get attendee profile
    SELECT display_name, username INTO attendee_profile
    FROM profiles
    WHERE user_id = NEW.user_id;
    
    -- Create notification for event creator
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for event attendance notifications
CREATE TRIGGER trigger_notify_event_attendance
  AFTER INSERT ON public.event_attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_event_attendance();