-- Create team role enum
CREATE TYPE public.team_role AS ENUM ('owner', 'admin', 'coach', 'member');

-- Create teams table
CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  avatar_url text,
  is_private boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT name_min_length CHECK (char_length(name) >= 2),
  CONSTRAINT name_max_length CHECK (char_length(name) <= 100)
);

CREATE INDEX idx_teams_created_by ON public.teams(created_by);
CREATE INDEX idx_teams_is_private ON public.teams(is_private);
CREATE INDEX idx_teams_created_at ON public.teams(created_at DESC);

CREATE TRIGGER teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create team_members table
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_team_members_status ON public.team_members(status);

-- Create team_member_roles table
CREATE TABLE public.team_member_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id uuid NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  role team_role NOT NULL DEFAULT 'member',
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  assigned_by uuid REFERENCES public.profiles(user_id),
  UNIQUE(team_member_id, role)
);

CREATE INDEX idx_team_member_roles_team_member_id ON public.team_member_roles(team_member_id);
CREATE INDEX idx_team_member_roles_role ON public.team_member_roles(role);

-- Create team_invitations table
CREATE TABLE public.team_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  invited_by uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  email text NOT NULL,
  invited_user_id uuid REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamp with time zone,
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_team_invitations_team_id ON public.team_invitations(team_id);
CREATE INDEX idx_team_invitations_email ON public.team_invitations(email);
CREATE INDEX idx_team_invitations_status ON public.team_invitations(status);
CREATE INDEX idx_team_invitations_invited_user_id ON public.team_invitations(invited_user_id);

-- Create team_announcements table
CREATE TABLE public.team_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  posted_by uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 2000),
  is_pinned boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_team_announcements_team_id ON public.team_announcements(team_id);
CREATE INDEX idx_team_announcements_posted_by ON public.team_announcements(posted_by);
CREATE INDEX idx_team_announcements_created_at ON public.team_announcements(created_at DESC);
CREATE INDEX idx_team_announcements_pinned ON public.team_announcements(is_pinned, created_at DESC);

CREATE TRIGGER team_announcements_updated_at
  BEFORE UPDATE ON public.team_announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create training_sessions table
CREATE TABLE public.training_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) >= 2 AND char_length(title) <= 200),
  description text,
  location text,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  created_by uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_training_sessions_team_id ON public.training_sessions(team_id);
CREATE INDEX idx_training_sessions_start_time ON public.training_sessions(start_time);
CREATE INDEX idx_training_sessions_created_by ON public.training_sessions(created_by);

CREATE TRIGGER training_sessions_updated_at
  BEFORE UPDATE ON public.training_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Database Functions

-- Get user role in team
CREATE OR REPLACE FUNCTION public.get_user_team_role(
  _user_id uuid,
  _team_id uuid
)
RETURNS team_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tmr.role
  FROM public.team_members tm
  JOIN public.team_member_roles tmr ON tmr.team_member_id = tm.id
  WHERE tm.user_id = _user_id
    AND tm.team_id = _team_id
    AND tm.status = 'active'
  ORDER BY 
    CASE tmr.role
      WHEN 'owner' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'coach' THEN 3
      WHEN 'member' THEN 4
    END
  LIMIT 1;
$$;

-- Check if user is team member
CREATE OR REPLACE FUNCTION public.is_team_member(
  _user_id uuid,
  _team_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_members
    WHERE user_id = _user_id
      AND team_id = _team_id
      AND status = 'active'
  );
$$;

-- Check if user can manage team
CREATE OR REPLACE FUNCTION public.can_manage_team(
  _user_id uuid,
  _team_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_members tm
    JOIN public.team_member_roles tmr ON tmr.team_member_id = tm.id
    WHERE tm.user_id = _user_id
      AND tm.team_id = _team_id
      AND tm.status = 'active'
      AND tmr.role IN ('owner', 'admin')
  );
$$;

-- Get team member count
CREATE OR REPLACE FUNCTION public.get_team_member_count(_team_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)
  FROM public.team_members
  WHERE team_id = _team_id
    AND status = 'active';
$$;

-- Auto-assign owner role trigger
CREATE OR REPLACE FUNCTION public.handle_new_team_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_member_id uuid;
BEGIN
  INSERT INTO public.team_members (team_id, user_id, status)
  VALUES (NEW.id, NEW.created_by, 'active')
  RETURNING id INTO new_member_id;
  
  INSERT INTO public.team_member_roles (team_member_id, role, assigned_by)
  VALUES (new_member_id, 'owner', NEW.created_by);
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER team_owner_assignment
  AFTER INSERT ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_team_owner();

-- RLS Policies

-- Teams table RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teams are viewable based on privacy"
  ON public.teams
  FOR SELECT
  USING (
    NOT is_private 
    OR public.is_team_member(auth.uid(), id)
  );

CREATE POLICY "Authenticated users can create teams"
  ON public.teams
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Team admins can update teams"
  ON public.teams
  FOR UPDATE
  TO authenticated
  USING (public.can_manage_team(auth.uid(), id))
  WITH CHECK (public.can_manage_team(auth.uid(), id));

CREATE POLICY "Team owners can delete teams"
  ON public.teams
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.team_members tm
      JOIN public.team_member_roles tmr ON tmr.team_member_id = tm.id
      WHERE tm.user_id = auth.uid()
        AND tm.team_id = teams.id
        AND tmr.role = 'owner'
    )
  );

-- Team members table RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members viewable by team members"
  ON public.team_members
  FOR SELECT
  USING (public.is_team_member(auth.uid(), team_id));

CREATE POLICY "Team admins can add members"
  ON public.team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (public.can_manage_team(auth.uid(), team_id));

CREATE POLICY "Team admins can update members"
  ON public.team_members
  FOR UPDATE
  TO authenticated
  USING (public.can_manage_team(auth.uid(), team_id));

CREATE POLICY "Members can be removed by admins or leave themselves"
  ON public.team_members
  FOR DELETE
  TO authenticated
  USING (
    public.can_manage_team(auth.uid(), team_id)
    OR auth.uid() = user_id
  );

-- Team member roles table RLS
ALTER TABLE public.team_member_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Roles viewable by team members"
  ON public.team_member_roles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.team_members tm
      WHERE tm.id = team_member_id
        AND public.is_team_member(auth.uid(), tm.team_id)
    )
  );

CREATE POLICY "Team admins can manage roles"
  ON public.team_member_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.team_members tm
      WHERE tm.id = team_member_id
        AND public.can_manage_team(auth.uid(), tm.team_id)
    )
  );

-- Team invitations table RLS
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team invitations viewable by team members"
  ON public.team_invitations
  FOR SELECT
  USING (
    public.is_team_member(auth.uid(), team_id)
    OR auth.uid() = invited_user_id
  );

CREATE POLICY "Team admins can send invitations"
  ON public.team_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.can_manage_team(auth.uid(), team_id)
    AND auth.uid() = invited_by
  );

CREATE POLICY "Users can respond to their invitations"
  ON public.team_invitations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = invited_user_id)
  WITH CHECK (auth.uid() = invited_user_id);

-- Team announcements table RLS
ALTER TABLE public.team_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team announcements viewable by team members"
  ON public.team_announcements
  FOR SELECT
  USING (public.is_team_member(auth.uid(), team_id));

CREATE POLICY "Team members can post announcements"
  ON public.team_announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_team_member(auth.uid(), team_id)
    AND auth.uid() = posted_by
  );

CREATE POLICY "Users can manage their announcements"
  ON public.team_announcements
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = posted_by
    OR public.can_manage_team(auth.uid(), team_id)
  );

CREATE POLICY "Users can delete their announcements"
  ON public.team_announcements
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = posted_by
    OR public.can_manage_team(auth.uid(), team_id)
  );

-- Training sessions table RLS
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Training sessions viewable by team members"
  ON public.training_sessions
  FOR SELECT
  USING (public.is_team_member(auth.uid(), team_id));

CREATE POLICY "Team admins and coaches can create sessions"
  ON public.training_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by
    AND (
      public.can_manage_team(auth.uid(), team_id)
      OR public.get_user_team_role(auth.uid(), team_id) = 'coach'
    )
  );

CREATE POLICY "Creators and admins can update sessions"
  ON public.training_sessions
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by
    OR public.can_manage_team(auth.uid(), team_id)
  );

CREATE POLICY "Creators and admins can delete sessions"
  ON public.training_sessions
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = created_by
    OR public.can_manage_team(auth.uid(), team_id)
  );

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_member_roles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_invitations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.training_sessions;