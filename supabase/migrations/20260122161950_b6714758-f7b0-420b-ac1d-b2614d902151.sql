-- Create function to auto-add attendance when join request is approved
CREATE OR REPLACE FUNCTION auto_add_attendance_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Only act when status changes from pending to approved
  IF OLD.status = 'pending' AND NEW.status = 'approved' THEN
    INSERT INTO event_attendance (event_id, user_id, status)
    VALUES (NEW.event_id, NEW.user_id, 'attending')
    ON CONFLICT (event_id, user_id) 
    DO UPDATE SET status = 'attending', updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to fire on join request update
CREATE TRIGGER trigger_auto_attendance_on_approval
  AFTER UPDATE ON event_join_requests
  FOR EACH ROW
  EXECUTE FUNCTION auto_add_attendance_on_approval();