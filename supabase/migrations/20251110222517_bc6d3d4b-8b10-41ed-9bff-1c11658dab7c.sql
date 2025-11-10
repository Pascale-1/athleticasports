-- Create player_performance_levels table
CREATE TABLE public.player_performance_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 4),
  assigned_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  UNIQUE(team_id, user_id)
);

CREATE INDEX idx_performance_team_id ON public.player_performance_levels(team_id);
CREATE INDEX idx_performance_user_id ON public.player_performance_levels(user_id);

-- Create training_session_teams table
CREATE TABLE public.training_session_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_session_id UUID NOT NULL REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  team_number INTEGER NOT NULL,
  average_level NUMERIC(3,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_session_teams ON public.training_session_teams(training_session_id);

-- Create training_session_team_members table
CREATE TABLE public.training_session_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_team_id UUID NOT NULL REFERENCES public.training_session_teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  performance_level INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_session_team_members ON public.training_session_team_members(session_team_id);

-- RLS Policies for player_performance_levels
ALTER TABLE public.player_performance_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view performance levels"
ON public.player_performance_levels
FOR SELECT
USING (is_team_member(auth.uid(), team_id));

CREATE POLICY "Coaches and admins can assign performance levels"
ON public.player_performance_levels
FOR INSERT
WITH CHECK (
  (can_manage_team(auth.uid(), team_id) OR get_user_team_role(auth.uid(), team_id) = 'coach'::team_role)
  AND auth.uid() = assigned_by
);

CREATE POLICY "Coaches and admins can update performance levels"
ON public.player_performance_levels
FOR UPDATE
USING (can_manage_team(auth.uid(), team_id) OR get_user_team_role(auth.uid(), team_id) = 'coach'::team_role);

CREATE POLICY "Coaches and admins can delete performance levels"
ON public.player_performance_levels
FOR DELETE
USING (can_manage_team(auth.uid(), team_id) OR get_user_team_role(auth.uid(), team_id) = 'coach'::team_role);

-- RLS Policies for training_session_teams
ALTER TABLE public.training_session_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view session teams"
ON public.training_session_teams
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.training_sessions ts
    WHERE ts.id = training_session_teams.training_session_id
    AND is_team_member(auth.uid(), ts.team_id)
  )
);

CREATE POLICY "Coaches and admins can create session teams"
ON public.training_session_teams
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.training_sessions ts
    WHERE ts.id = training_session_teams.training_session_id
    AND (can_manage_team(auth.uid(), ts.team_id) OR get_user_team_role(auth.uid(), ts.team_id) = 'coach'::team_role)
  )
);

CREATE POLICY "Coaches and admins can delete session teams"
ON public.training_session_teams
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.training_sessions ts
    WHERE ts.id = training_session_teams.training_session_id
    AND (can_manage_team(auth.uid(), ts.team_id) OR get_user_team_role(auth.uid(), ts.team_id) = 'coach'::team_role)
  )
);

-- RLS Policies for training_session_team_members
ALTER TABLE public.training_session_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view session team members"
ON public.training_session_team_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.training_session_teams tst
    JOIN public.training_sessions ts ON ts.id = tst.training_session_id
    WHERE tst.id = training_session_team_members.session_team_id
    AND is_team_member(auth.uid(), ts.team_id)
  )
);

CREATE POLICY "Coaches and admins can create session team members"
ON public.training_session_team_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.training_session_teams tst
    JOIN public.training_sessions ts ON ts.id = tst.training_session_id
    WHERE tst.id = training_session_team_members.session_team_id
    AND (can_manage_team(auth.uid(), ts.team_id) OR get_user_team_role(auth.uid(), ts.team_id) = 'coach'::team_role)
  )
);

CREATE POLICY "Coaches and admins can delete session team members"
ON public.training_session_team_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.training_session_teams tst
    JOIN public.training_sessions ts ON ts.id = tst.training_session_id
    WHERE tst.id = training_session_team_members.session_team_id
    AND (can_manage_team(auth.uid(), ts.team_id) OR get_user_team_role(auth.uid(), ts.team_id) = 'coach'::team_role)
  )
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.player_performance_levels;
ALTER PUBLICATION supabase_realtime ADD TABLE public.training_session_teams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.training_session_team_members;