-- Add visibility column to activities table
ALTER TABLE activities 
  ADD COLUMN visibility TEXT DEFAULT 'team' CHECK (visibility IN ('private', 'team', 'public'));

-- Add index for efficient feed queries
CREATE INDEX idx_activities_visibility_date ON activities(visibility, created_at DESC);

-- Update RLS policy to allow team members to see team activities
DROP POLICY IF EXISTS "Users can view their own activities" ON activities;

CREATE POLICY "Users can view their own activities"
  ON activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view team activities from followed users"
  ON activities FOR SELECT
  USING (
    visibility = 'team' 
    AND (
      -- User follows the activity owner
      EXISTS (
        SELECT 1 FROM followers 
        WHERE follower_id = auth.uid() 
        AND following_id = user_id
      )
      -- OR they share a team
      OR EXISTS (
        SELECT 1 FROM team_members tm1
        JOIN team_members tm2 ON tm1.team_id = tm2.team_id
        WHERE tm1.user_id = auth.uid() 
        AND tm2.user_id = activities.user_id
        AND tm1.status = 'active'
        AND tm2.status = 'active'
      )
    )
  );

CREATE POLICY "Users can view public activities"
  ON activities FOR SELECT
  USING (visibility = 'public');