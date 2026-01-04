-- Add onboarding fields to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS preferred_district text,
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_founding_member boolean DEFAULT false;

-- Mark existing users as founding members
UPDATE profiles SET is_founding_member = true WHERE is_founding_member IS NULL OR is_founding_member = false;