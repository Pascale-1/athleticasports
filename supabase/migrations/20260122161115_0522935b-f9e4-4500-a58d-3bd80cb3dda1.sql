-- Create notification trigger for request status updates (approved/rejected)
CREATE OR REPLACE FUNCTION notify_event_join_request_response()
RETURNS TRIGGER AS $$
DECLARE
  event_record RECORD;
  organizer_name TEXT;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Only notify if status changed from 'pending' to 'approved' or 'rejected'
  IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
    -- Get event details
    SELECT * INTO event_record FROM events WHERE id = NEW.event_id;
    
    -- Get organizer name
    SELECT COALESCE(display_name, username) INTO organizer_name
      FROM profiles WHERE user_id = NEW.responded_by;
    
    IF NEW.status = 'approved' THEN
      notification_title := 'Request Approved';
      notification_message := 'Your request to join "' || event_record.title || '" has been approved!';
    ELSE
      notification_title := 'Request Declined';
      notification_message := 'Your request to join "' || event_record.title || '" was declined.';
    END IF;
    
    -- Notify the requester (the person who requested to join)
    INSERT INTO notifications (user_id, type, title, message, link, metadata)
    VALUES (
      NEW.user_id,
      'event_join_response',
      notification_title,
      notification_message,
      '/events/' || NEW.event_id,
      jsonb_build_object(
        'event_id', NEW.event_id,
        'event_title', event_record.title,
        'request_id', NEW.id,
        'status', NEW.status,
        'responded_by', NEW.responded_by,
        'responded_by_name', organizer_name
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_notify_event_join_request_response ON event_join_requests;
CREATE TRIGGER trigger_notify_event_join_request_response
  AFTER UPDATE ON event_join_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_event_join_request_response();