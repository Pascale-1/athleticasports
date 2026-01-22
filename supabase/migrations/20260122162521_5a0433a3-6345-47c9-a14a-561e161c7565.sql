-- Drop existing trigger and function to recreate with proper RLS bypass
DROP TRIGGER IF EXISTS trigger_auto_attendance_on_approval ON event_join_requests;
DROP FUNCTION IF EXISTS auto_add_attendance_on_approval();

-- Create function with explicit RLS bypass
CREATE OR REPLACE FUNCTION auto_add_attendance_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status = 'approved' THEN
    INSERT INTO public.event_attendance (event_id, user_id, status)
    VALUES (NEW.event_id, NEW.user_id, 'attending')
    ON CONFLICT (event_id, user_id) 
    DO UPDATE SET status = 'attending', updated_at = now();
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to create attendance: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
   SECURITY DEFINER 
   SET search_path = public
   SET row_security = off;

-- Recreate trigger
CREATE TRIGGER trigger_auto_attendance_on_approval
  AFTER UPDATE ON event_join_requests
  FOR EACH ROW
  EXECUTE FUNCTION auto_add_attendance_on_approval();

-- Create function to auto-add creator as attending on event creation
CREATE OR REPLACE FUNCTION auto_add_creator_attendance()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.event_attendance (event_id, user_id, status)
  VALUES (NEW.id, NEW.created_by, 'attending')
  ON CONFLICT (event_id, user_id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to create creator attendance: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
   SECURITY DEFINER 
   SET search_path = public
   SET row_security = off;

-- Create trigger for auto-creator attendance
CREATE TRIGGER trigger_auto_creator_attendance
  AFTER INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION auto_add_creator_attendance();

-- Fix existing data: Add attendance for all approved requests that are missing
INSERT INTO event_attendance (event_id, user_id, status)
SELECT ejr.event_id, ejr.user_id, 'attending'
FROM event_join_requests ejr
WHERE ejr.status = 'approved'
  AND NOT EXISTS (
    SELECT 1 FROM event_attendance ea 
    WHERE ea.event_id = ejr.event_id 
      AND ea.user_id = ejr.user_id
  );

-- Fix existing data: Add creators as attending for their events
INSERT INTO event_attendance (event_id, user_id, status)
SELECT e.id, e.created_by, 'attending'
FROM events e
WHERE NOT EXISTS (
  SELECT 1 FROM event_attendance ea 
  WHERE ea.event_id = e.id 
    AND ea.user_id = e.created_by
);