-- Create event type enum
CREATE TYPE public.event_type AS ENUM ('training', 'meetup', 'match');

-- Create location type enum
CREATE TYPE public.location_type AS ENUM ('physical', 'virtual', 'tbd');

-- Create home/away enum
CREATE TYPE public.home_away AS ENUM ('home', 'away', 'neutral');

-- Create unified events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  type event_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  location_type location_type DEFAULT 'physical',
  location_url TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  max_participants INTEGER,
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_rule TEXT,
  
  -- Match-specific fields
  opponent_name TEXT,
  opponent_logo_url TEXT,
  match_format TEXT,
  home_away home_away,
  
  -- Meetup-specific fields
  meetup_category TEXT,
  
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Migrate existing training_sessions to events
INSERT INTO public.events (
  id, team_id, type, title, description, location, start_time, end_time, 
  created_by, created_at, updated_at
)
SELECT 
  id, team_id, 'training'::event_type, title, description, location, 
  start_time, end_time, created_by, created_at, updated_at
FROM public.training_sessions;

-- Create event_attendance table
CREATE TABLE public.event_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('attending', 'maybe', 'not_attending')),
  responded_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Migrate training_session_attendance to event_attendance
INSERT INTO public.event_attendance (event_id, user_id, status, responded_at, updated_at)
SELECT session_id, user_id, status, responded_at, updated_at
FROM public.training_session_attendance;

-- Rename training_session_teams to event_teams
ALTER TABLE public.training_session_teams 
  RENAME TO event_teams;

ALTER TABLE public.event_teams 
  RENAME COLUMN training_session_id TO event_id;

-- Rename training_session_team_members to event_team_members
ALTER TABLE public.training_session_team_members 
  RENAME TO event_team_members;

ALTER TABLE public.event_team_members 
  RENAME COLUMN session_team_id TO event_team_id;

-- Update foreign key constraint on event_teams
ALTER TABLE public.event_teams 
  DROP CONSTRAINT training_session_teams_training_session_id_fkey;

ALTER TABLE public.event_teams 
  ADD CONSTRAINT event_teams_event_id_fkey 
  FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;

-- Update foreign key constraint on event_team_members
ALTER TABLE public.event_team_members 
  DROP CONSTRAINT training_session_team_members_session_team_id_fkey;

ALTER TABLE public.event_team_members 
  ADD CONSTRAINT event_team_members_event_team_id_fkey 
  FOREIGN KEY (event_team_id) REFERENCES public.event_teams(id) ON DELETE CASCADE;

-- Enable RLS on events table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events
-- Public events are viewable by everyone
CREATE POLICY "Public events are viewable by everyone"
  ON public.events FOR SELECT
  USING (is_public = true);

-- Team events are viewable by team members
CREATE POLICY "Team events viewable by team members"
  ON public.events FOR SELECT
  USING (
    team_id IS NULL OR 
    is_team_member(auth.uid(), team_id)
  );

-- Team admins and coaches can create events for their team
CREATE POLICY "Team managers can create events"
  ON public.events FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND (
      team_id IS NULL OR
      can_manage_team(auth.uid(), team_id) OR 
      get_user_team_role(auth.uid(), team_id) = 'coach'
    )
  );

-- Anyone can create public events (meetups)
CREATE POLICY "Users can create public events"
  ON public.events FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND 
    is_public = true AND 
    team_id IS NULL
  );

-- Creators and team admins can update events
CREATE POLICY "Creators and team admins can update events"
  ON public.events FOR UPDATE
  USING (
    auth.uid() = created_by OR 
    (team_id IS NOT NULL AND can_manage_team(auth.uid(), team_id))
  );

-- Creators and team admins can delete events
CREATE POLICY "Creators and team admins can delete events"
  ON public.events FOR DELETE
  USING (
    auth.uid() = created_by OR 
    (team_id IS NOT NULL AND can_manage_team(auth.uid(), team_id))
  );

-- Enable RLS on event_attendance table
ALTER TABLE public.event_attendance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_attendance
-- Users can view attendance for events they can see
CREATE POLICY "Users can view event attendance"
  ON public.event_attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_attendance.event_id
      AND (
        e.is_public = true OR
        e.team_id IS NULL OR
        is_team_member(auth.uid(), e.team_id)
      )
    )
  );

-- Users can add their own attendance
CREATE POLICY "Users can add their own attendance"
  ON public.event_attendance FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_attendance.event_id
      AND (
        e.is_public = true OR
        e.team_id IS NULL OR
        is_team_member(auth.uid(), e.team_id)
      )
    )
  );

-- Users can update their own attendance
CREATE POLICY "Users can update their own attendance"
  ON public.event_attendance FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own attendance
CREATE POLICY "Users can delete their own attendance"
  ON public.event_attendance FOR DELETE
  USING (auth.uid() = user_id);

-- Update RLS policies on event_teams (formerly training_session_teams)
DROP POLICY IF EXISTS "Team members can view session teams" ON public.event_teams;
DROP POLICY IF EXISTS "Coaches and admins can create session teams" ON public.event_teams;
DROP POLICY IF EXISTS "Coaches and admins can delete session teams" ON public.event_teams;

CREATE POLICY "Team members can view event teams"
  ON public.event_teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_teams.event_id
      AND is_team_member(auth.uid(), e.team_id)
    )
  );

CREATE POLICY "Coaches and admins can create event teams"
  ON public.event_teams FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_teams.event_id
      AND (
        can_manage_team(auth.uid(), e.team_id) OR 
        get_user_team_role(auth.uid(), e.team_id) = 'coach'
      )
    )
  );

CREATE POLICY "Coaches and admins can delete event teams"
  ON public.event_teams FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_teams.event_id
      AND (
        can_manage_team(auth.uid(), e.team_id) OR 
        get_user_team_role(auth.uid(), e.team_id) = 'coach'
      )
    )
  );

-- Update RLS policies on event_team_members (formerly training_session_team_members)
DROP POLICY IF EXISTS "Team members can view session team members" ON public.event_team_members;
DROP POLICY IF EXISTS "Coaches and admins can create session team members" ON public.event_team_members;
DROP POLICY IF EXISTS "Coaches and admins can delete session team members" ON public.event_team_members;

CREATE POLICY "Team members can view event team members"
  ON public.event_team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.event_teams et
      JOIN public.events e ON e.id = et.event_id
      WHERE et.id = event_team_members.event_team_id
      AND is_team_member(auth.uid(), e.team_id)
    )
  );

CREATE POLICY "Coaches and admins can create event team members"
  ON public.event_team_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.event_teams et
      JOIN public.events e ON e.id = et.event_id
      WHERE et.id = event_team_members.event_team_id
      AND (
        can_manage_team(auth.uid(), e.team_id) OR 
        get_user_team_role(auth.uid(), e.team_id) = 'coach'
      )
    )
  );

CREATE POLICY "Coaches and admins can delete event team members"
  ON public.event_team_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.event_teams et
      JOIN public.events e ON e.id = et.event_id
      WHERE et.id = event_team_members.event_team_id
      AND (
        can_manage_team(auth.uid(), e.team_id) OR 
        get_user_team_role(auth.uid(), e.team_id) = 'coach'
      )
    )
  );

-- Add updated_at trigger for events
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for event_attendance
CREATE TRIGGER update_event_attendance_updated_at
  BEFORE UPDATE ON public.event_attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create notification function for new events
CREATE OR REPLACE FUNCTION public.notify_new_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member RECORD;
  team_name TEXT;
  creator_name TEXT;
  event_time TEXT;
  event_icon TEXT;
BEGIN
  -- Determine event icon
  event_icon := CASE NEW.type
    WHEN 'training' THEN '🏋️'
    WHEN 'match' THEN '⚽'
    WHEN 'meetup' THEN '👥'
    ELSE '📅'
  END;
  
  SELECT COALESCE(display_name, username) INTO creator_name
  FROM profiles WHERE user_id = NEW.created_by;
  
  event_time := to_char(NEW.start_time, 'Mon DD at HH24:MI');
  
  -- If it's a team event, notify team members
  IF NEW.team_id IS NOT NULL THEN
    SELECT name INTO team_name FROM teams WHERE id = NEW.team_id;
    
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
        'New ' || initcap(NEW.type::text) || ' Event',
        event_icon || ' ' || team_name || ': ' || NEW.title || ' on ' || event_time,
        '/events/' || NEW.id,
        jsonb_build_object('team_id', NEW.team_id, 'event_id', NEW.id, 'event_type', NEW.type)
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add trigger for event notifications
CREATE TRIGGER notify_new_event_trigger
  AFTER INSERT ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_event();

-- Drop old training_sessions table and related attendance table
DROP TABLE IF EXISTS public.training_session_attendance CASCADE;
DROP TABLE IF EXISTS public.training_sessions CASCADE;