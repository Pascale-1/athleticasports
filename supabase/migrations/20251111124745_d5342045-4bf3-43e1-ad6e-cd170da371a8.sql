-- Add missing foreign key constraint to profiles table
-- This enables PostgREST to perform automatic joins for user profiles

-- Add foreign key to profiles table (enables user data joins)
ALTER TABLE event_attendance
  ADD CONSTRAINT event_attendance_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(user_id) 
  ON DELETE CASCADE;

-- Add indexes for performance (these columns are queried frequently)
CREATE INDEX IF NOT EXISTS idx_event_attendance_user_id 
  ON event_attendance(user_id);

CREATE INDEX IF NOT EXISTS idx_event_attendance_event_id 
  ON event_attendance(event_id);

-- Add comments for documentation
COMMENT ON CONSTRAINT event_attendance_user_id_fkey ON event_attendance 
  IS 'Links attendance records to user profiles, enables automatic joins';