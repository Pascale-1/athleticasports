-- Add location_district to player_availability for normalized location matching
ALTER TABLE public.player_availability 
ADD COLUMN IF NOT EXISTS location_district text;

-- Add location_district to events for normalized location matching  
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS location_district text;

-- Add match_score to match_proposals to store compatibility score
ALTER TABLE public.match_proposals
ADD COLUMN IF NOT EXISTS match_score integer DEFAULT 0;

-- Add interest_level to match_proposals for soft commitment flow
ALTER TABLE public.match_proposals
ADD COLUMN IF NOT EXISTS interest_level text DEFAULT 'pending' CHECK (interest_level IN ('pending', 'interested', 'committed', 'declined'));

-- Add skill requirements to events for skill-based matching
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS skill_level_min integer CHECK (skill_level_min >= 1 AND skill_level_min <= 5);

ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS skill_level_max integer CHECK (skill_level_max >= 1 AND skill_level_max <= 5);

-- Create index for faster matching queries
CREATE INDEX IF NOT EXISTS idx_player_availability_active_sport 
ON public.player_availability(sport, is_active, expires_at) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_events_looking_for_players 
ON public.events(sport, start_time, looking_for_players) 
WHERE looking_for_players = true;

CREATE INDEX IF NOT EXISTS idx_events_location_district 
ON public.events(location_district) 
WHERE location_district IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_player_availability_location_district 
ON public.player_availability(location_district) 
WHERE location_district IS NOT NULL;