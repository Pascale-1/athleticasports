ALTER TABLE public.player_availability ADD COLUMN IF NOT EXISTS reminder_sent boolean DEFAULT false;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;