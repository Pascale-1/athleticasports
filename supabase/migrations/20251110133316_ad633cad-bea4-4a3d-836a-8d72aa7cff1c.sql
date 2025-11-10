-- Add essential profile fields for Athletica MVP
ALTER TABLE public.profiles 
ADD COLUMN full_name TEXT,
ADD COLUMN primary_sport TEXT,
ADD COLUMN team_name TEXT;