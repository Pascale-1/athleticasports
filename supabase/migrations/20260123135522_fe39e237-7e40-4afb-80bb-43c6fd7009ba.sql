-- Update auto_add_creator_attendance to skip child occurrences of recurring events
-- Each occurrence should have independent RSVP instead of auto-copying the creator

CREATE OR REPLACE FUNCTION auto_add_creator_attendance()
RETURNS TRIGGER AS $$
BEGIN
  -- Skip auto-generated child occurrences of recurring events
  -- Each occurrence should have independent RSVP
  IF NEW.parent_event_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

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