-- Fix security warning: Set search_path on the function
CREATE OR REPLACE FUNCTION auto_add_attendance_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Only act when status changes from pending to approved
  IF OLD.status = 'pending' AND NEW.status = 'approved' THEN
    INSERT INTO public.event_attendance (event_id, user_id, status)
    VALUES (NEW.event_id, NEW.user_id, 'attending')
    ON CONFLICT (event_id, user_id) 
    DO UPDATE SET status = 'attending', updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;