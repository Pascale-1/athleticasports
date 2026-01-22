-- Add email column to profiles
ALTER TABLE profiles ADD COLUMN email text;

-- Create index for email search
CREATE INDEX idx_profiles_email ON profiles(email);

-- Create a trigger to sync email from auth.users on profile creation/update
CREATE OR REPLACE FUNCTION sync_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email := (SELECT email FROM auth.users WHERE id = NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_sync_profile_email
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_email();

-- Backfill existing profiles with emails from auth.users
UPDATE profiles p
SET email = (SELECT email FROM auth.users WHERE id = p.user_id);