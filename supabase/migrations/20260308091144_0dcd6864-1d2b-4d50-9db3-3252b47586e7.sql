CREATE OR REPLACE VIEW public.profiles_public AS
SELECT id, user_id, username, display_name, avatar_url, bio, full_name,
       primary_sport, team_name, preferred_district, is_founding_member,
       onboarding_completed, created_at, updated_at
FROM public.profiles;