-- Create event join requests table
CREATE TABLE event_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  responded_by uuid,
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE event_join_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own requests"
  ON event_join_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Event creators can view all requests for their events
CREATE POLICY "Organizers can view event requests"
  ON event_join_requests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM events e WHERE e.id = event_id AND e.created_by = auth.uid()
  ));

-- Users can create requests
CREATE POLICY "Users can create requests"
  ON event_join_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only organizers can update request status
CREATE POLICY "Organizers can update requests"
  ON event_join_requests FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM events e WHERE e.id = event_id AND e.created_by = auth.uid()
  ));

-- Create notification trigger function
CREATE OR REPLACE FUNCTION notify_event_join_request()
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_notify_event_join_request
  AFTER INSERT ON event_join_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_event_join_request();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE event_join_requests;