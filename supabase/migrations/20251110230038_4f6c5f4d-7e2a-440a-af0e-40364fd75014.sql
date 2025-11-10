-- Create training_session_attendance table
CREATE TABLE IF NOT EXISTS public.training_session_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('attending', 'not_attending', 'maybe')),
  responded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- Enable RLS
ALTER TABLE public.training_session_attendance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attendance
CREATE POLICY "Team members can view attendance for their team sessions"
ON public.training_session_attendance
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM training_sessions ts
    WHERE ts.id = training_session_attendance.session_id
      AND is_team_member(auth.uid(), ts.team_id)
  )
);

CREATE POLICY "Team members can add their own attendance"
ON public.training_session_attendance
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM training_sessions ts
    WHERE ts.id = training_session_attendance.session_id
      AND is_team_member(auth.uid(), ts.team_id)
  )
);

CREATE POLICY "Users can update their own attendance"
ON public.training_session_attendance
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own attendance"
ON public.training_session_attendance
FOR DELETE
USING (auth.uid() = user_id);

-- Create updated trigger function with announcement
CREATE OR REPLACE FUNCTION public.notify_training_session_with_announcement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member RECORD;
  team_name text;
  creator_name text;
  session_time text;
  announcement_id uuid;
BEGIN
  SELECT name INTO team_name FROM teams WHERE id = NEW.team_id;
  SELECT COALESCE(display_name, username) INTO creator_name
  FROM profiles WHERE user_id = NEW.created_by;
  
  session_time := to_char(NEW.start_time, 'Mon DD at HH24:MI');
  
  -- Create announcement for the training session
  INSERT INTO team_announcements (team_id, posted_by, content, is_pinned)
  VALUES (
    NEW.team_id,
    NEW.created_by,
    '📅 **New Training Session: ' || NEW.title || '**' || E'\n\n' ||
    '🕐 ' || session_time || ' - ' || to_char(NEW.end_time, 'HH24:MI') || E'\n' ||
    CASE WHEN NEW.location IS NOT NULL THEN '📍 ' || NEW.location || E'\n' ELSE '' END ||
    CASE WHEN NEW.description IS NOT NULL THEN E'\n' || NEW.description || E'\n' ELSE '' END ||
    E'\n_Mark your attendance in the Training tab!_',
    false
  )
  RETURNING id INTO announcement_id;
  
  -- Send notifications to all team members
  FOR member IN 
    SELECT user_id FROM team_members 
    WHERE team_id = NEW.team_id 
      AND status = 'active'
      AND user_id != NEW.created_by
  LOOP
    INSERT INTO notifications (user_id, type, title, message, link, metadata)
    VALUES (
      member.user_id,
      'training_session',
      'New Training Session',
      team_name || ': ' || NEW.title || ' on ' || session_time,
      '/teams/' || NEW.team_id || '?tab=training',
      jsonb_build_object(
        'team_id', NEW.team_id, 
        'session_id', NEW.id,
        'announcement_id', announcement_id
      )
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Update the trigger
DROP TRIGGER IF EXISTS on_training_session_created ON training_sessions;
CREATE TRIGGER on_training_session_created
  AFTER INSERT ON training_sessions
  FOR EACH ROW
  EXECUTE FUNCTION notify_training_session_with_announcement();

-- Helper function: Get attendance count by status
CREATE OR REPLACE FUNCTION public.get_session_attendance_count(
  _session_id uuid,
  _status text DEFAULT NULL
)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)
  FROM training_session_attendance
  WHERE session_id = _session_id
    AND (_status IS NULL OR status = _status);
$$;

-- Helper function: Get user's attendance status
CREATE OR REPLACE FUNCTION public.get_user_attendance_status(
  _session_id uuid,
  _user_id uuid
)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT status
  FROM training_session_attendance
  WHERE session_id = _session_id
    AND user_id = _user_id;
$$;

-- Add trigger for updated_at
CREATE TRIGGER update_training_session_attendance_updated_at
  BEFORE UPDATE ON training_session_attendance
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();