-- Add role column to team_invitations table
ALTER TABLE public.team_invitations
ADD COLUMN role team_role NOT NULL DEFAULT 'member';