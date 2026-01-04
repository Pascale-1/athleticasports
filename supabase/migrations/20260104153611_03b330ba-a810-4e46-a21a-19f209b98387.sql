-- Create player_availability table
CREATE TABLE IF NOT EXISTS public.player_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  sport TEXT NOT NULL,
  available_from TIMESTAMPTZ NOT NULL,
  available_until TIMESTAMPTZ NOT NULL,
  location TEXT,
  skill_level INTEGER CHECK (skill_level >= 1 AND skill_level <= 5),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days')
);

-- Create match_proposals table
CREATE TABLE IF NOT EXISTS public.match_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  player_user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  proposed_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  commitment_acknowledged_at TIMESTAMPTZ,
  UNIQUE(event_id, player_user_id)
);

-- Add columns to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS looking_for_players BOOLEAN DEFAULT false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS players_needed INTEGER;

-- Add is_committed column to event_attendance
ALTER TABLE public.event_attendance ADD COLUMN IF NOT EXISTS is_committed BOOLEAN DEFAULT false;

-- Enable RLS
ALTER TABLE public.player_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_proposals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for player_availability
CREATE POLICY "Users can view all active availability"
ON public.player_availability FOR SELECT
USING (is_active = true OR user_id = auth.uid());

CREATE POLICY "Users can create their own availability"
ON public.player_availability FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own availability"
ON public.player_availability FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own availability"
ON public.player_availability FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for match_proposals
CREATE POLICY "Users can view their own proposals"
ON public.match_proposals FOR SELECT
USING (player_user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM events WHERE events.id = match_proposals.event_id AND events.created_by = auth.uid()
));

CREATE POLICY "System can create proposals"
ON public.match_proposals FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own proposals"
ON public.match_proposals FOR UPDATE
USING (player_user_id = auth.uid());

-- Update event_attendance DELETE policy to prevent cancellation of committed attendance
DROP POLICY IF EXISTS "Users can delete their own attendance" ON public.event_attendance;

CREATE POLICY "Users can delete non-committed attendance"
ON public.event_attendance FOR DELETE
USING (auth.uid() = user_id AND is_committed = false);