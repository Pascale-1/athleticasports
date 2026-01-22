-- Function to auto-add attendance when join request is approved
CREATE OR REPLACE FUNCTION public.handle_approved_join_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Only act on status change to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Insert attendance record (or update if exists)
    INSERT INTO public.event_attendance (event_id, user_id, status, responded_at)
    VALUES (NEW.event_id, NEW.user_id, 'attending', NOW())
    ON CONFLICT (event_id, user_id) 
    DO UPDATE SET status = 'attending', updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for approved join requests
CREATE TRIGGER trigger_handle_approved_join_request
  AFTER INSERT OR UPDATE ON public.event_join_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_approved_join_request();