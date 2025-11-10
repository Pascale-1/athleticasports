-- Enable full row replication for training-related tables
-- This ensures DELETE events include all columns, allowing filters to work correctly

ALTER TABLE public.training_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.training_session_attendance REPLICA IDENTITY FULL;
ALTER TABLE public.training_session_teams REPLICA IDENTITY FULL;
ALTER TABLE public.training_session_team_members REPLICA IDENTITY FULL;