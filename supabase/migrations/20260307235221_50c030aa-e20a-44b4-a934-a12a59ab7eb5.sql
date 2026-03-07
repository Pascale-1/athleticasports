-- 1. Profiles: restrict SELECT to authenticated only
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON profiles;
CREATE POLICY "Authenticated users can view profiles" ON profiles
  FOR SELECT TO authenticated USING (true);

-- 2. User roles: restrict SELECT to authenticated only
DROP POLICY IF EXISTS "User roles are viewable by everyone" ON user_roles;
CREATE POLICY "User roles are viewable by authenticated" ON user_roles
  FOR SELECT TO authenticated USING (true);

-- 3. Event attendance: restrict SELECT to authenticated only
DROP POLICY IF EXISTS "Users can view event attendance" ON event_attendance;
CREATE POLICY "Users can view event attendance" ON event_attendance
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = event_attendance.event_id
      AND (e.is_public = true OR e.team_id IS NULL OR is_team_member(auth.uid(), e.team_id))
  ));

-- 4. Player availability: restrict SELECT to authenticated only  
DROP POLICY IF EXISTS "Users can view all active availability" ON player_availability;
CREATE POLICY "Users can view all active availability" ON player_availability
  FOR SELECT TO authenticated
  USING ((is_active = true) OR (user_id = auth.uid()));

-- 5. Followers: restrict SELECT to authenticated only
DROP POLICY IF EXISTS "Followers are viewable by everyone" ON followers;
CREATE POLICY "Followers are viewable by authenticated" ON followers
  FOR SELECT TO authenticated USING (true);