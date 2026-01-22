-- Drop existing restrictive INSERT policies on events
DROP POLICY IF EXISTS "Team managers can create events" ON events;
DROP POLICY IF EXISTS "Users can create public events" ON events;

-- Recreate as PERMISSIVE policies (default behavior)
-- Policy 1: Any authenticated user can create events without a team
CREATE POLICY "Users can create events without team"
ON events FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by 
  AND team_id IS NULL
);

-- Policy 2: Team managers/coaches can create team events
CREATE POLICY "Team managers can create team events"
ON events FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by 
  AND team_id IS NOT NULL
  AND (can_manage_team(auth.uid(), team_id) OR get_user_team_role(auth.uid(), team_id) = 'coach')
);