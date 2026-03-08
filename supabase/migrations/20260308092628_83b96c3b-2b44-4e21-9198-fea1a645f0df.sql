
-- Migrate existing full_name data into display_name where display_name is null
UPDATE public.profiles 
SET display_name = full_name 
WHERE display_name IS NULL AND full_name IS NOT NULL;

-- Drop dependent views first
DROP VIEW IF EXISTS public.team_messages_with_profiles;
DROP VIEW IF EXISTS public.profiles_public;

-- Drop the full_name column
ALTER TABLE public.profiles DROP COLUMN IF EXISTS full_name;

-- Recreate profiles_public without full_name
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT id, user_id, username, display_name, avatar_url, bio,
       primary_sport, team_name, preferred_district, is_founding_member,
       onboarding_completed, created_at, updated_at
FROM public.profiles;

-- Recreate team_messages_with_profiles
CREATE OR REPLACE VIEW public.team_messages_with_profiles AS
SELECT tm.id, tm.team_id, tm.user_id, tm.content, tm.created_at, tm.updated_at, 
       tm.is_edited, tm.replied_to_id,
       p.username, p.display_name, p.avatar_url
FROM public.team_messages tm
LEFT JOIN public.profiles p ON p.user_id = tm.user_id;
