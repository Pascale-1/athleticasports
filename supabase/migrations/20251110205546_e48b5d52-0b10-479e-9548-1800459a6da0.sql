-- Add email tracking columns to team_invitations
ALTER TABLE public.team_invitations 
  ADD COLUMN IF NOT EXISTS email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS email_error text;

-- Create unique index to prevent duplicate pending invitations
CREATE UNIQUE INDEX IF NOT EXISTS unique_pending_invitation 
  ON public.team_invitations(team_id, email) 
  WHERE status = 'pending';

-- Add RLS policy to allow team admins to cancel invitations
CREATE POLICY "Team admins can cancel invitations"
  ON public.team_invitations 
  FOR DELETE 
  USING (can_manage_team(auth.uid(), team_id) OR auth.uid() = invited_by);