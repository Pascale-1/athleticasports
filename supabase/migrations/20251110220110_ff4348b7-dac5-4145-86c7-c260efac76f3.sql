-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('team_invitation', 'new_follower', 'team_announcement', 'training_session')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
ON notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications read status"
ON notifications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Database Functions
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE notifications
  SET read = true
  WHERE id = notification_id
    AND user_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION mark_all_notifications_read(_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE notifications
  SET read = true
  WHERE user_id = _user_id
    AND user_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION get_unread_count(_user_id UUID)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)
  FROM notifications
  WHERE user_id = _user_id
    AND read = false;
$$;

-- Trigger function for team invitations
CREATE OR REPLACE FUNCTION notify_team_invitation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  team_name text;
  inviter_name text;
BEGIN
  SELECT name INTO team_name FROM teams WHERE id = NEW.team_id;
  SELECT COALESCE(display_name, username) INTO inviter_name
  FROM profiles WHERE user_id = NEW.invited_by;
  
  IF NEW.invited_user_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, link, metadata)
    VALUES (
      NEW.invited_user_id,
      'team_invitation',
      'New Team Invitation',
      inviter_name || ' invited you to join ' || team_name,
      '/teams/invitations/accept?id=' || NEW.id,
      jsonb_build_object('team_id', NEW.team_id, 'invitation_id', NEW.id)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_team_invitation_created
AFTER INSERT ON team_invitations
FOR EACH ROW
EXECUTE FUNCTION notify_team_invitation();

-- Trigger function for new followers
CREATE OR REPLACE FUNCTION notify_new_follower()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  follower_name text;
BEGIN
  SELECT COALESCE(display_name, username) INTO follower_name
  FROM profiles WHERE user_id = NEW.follower_id;
  
  INSERT INTO notifications (user_id, type, title, message, link, metadata)
  VALUES (
    NEW.following_id,
    'new_follower',
    'New Follower',
    follower_name || ' started following you',
    '/users?user=' || NEW.follower_id,
    jsonb_build_object('follower_id', NEW.follower_id)
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_follower
AFTER INSERT ON followers
FOR EACH ROW
EXECUTE FUNCTION notify_new_follower();

-- Trigger function for team announcements
CREATE OR REPLACE FUNCTION notify_team_announcement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member RECORD;
  team_name text;
  poster_name text;
BEGIN
  SELECT name INTO team_name FROM teams WHERE id = NEW.team_id;
  SELECT COALESCE(display_name, username) INTO poster_name
  FROM profiles WHERE user_id = NEW.posted_by;
  
  FOR member IN 
    SELECT user_id FROM team_members 
    WHERE team_id = NEW.team_id 
      AND status = 'active'
      AND user_id != NEW.posted_by
  LOOP
    INSERT INTO notifications (user_id, type, title, message, link, metadata)
    VALUES (
      member.user_id,
      'team_announcement',
      'New Team Announcement',
      poster_name || ' posted in ' || team_name,
      '/teams/' || NEW.team_id,
      jsonb_build_object('team_id', NEW.team_id, 'announcement_id', NEW.id)
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_team_announcement_created
AFTER INSERT ON team_announcements
FOR EACH ROW
EXECUTE FUNCTION notify_team_announcement();

-- Trigger function for training sessions
CREATE OR REPLACE FUNCTION notify_training_session()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member RECORD;
  team_name text;
  creator_name text;
  session_time text;
BEGIN
  SELECT name INTO team_name FROM teams WHERE id = NEW.team_id;
  SELECT COALESCE(display_name, username) INTO creator_name
  FROM profiles WHERE user_id = NEW.created_by;
  
  session_time := to_char(NEW.start_time, 'Mon DD at HH24:MI');
  
  FOR member IN 
    SELECT user_id FROM team_members 
    WHERE team_id = NEW.team_id 
      AND status = 'active'
      AND user_id != NEW.created_by
  LOOP
    INSERT INTO notifications (user_id, type, title, message, link, metadata)
    VALUES (
      member.user_id,
      'training_session',
      'New Training Session',
      team_name || ': ' || NEW.title || ' on ' || session_time,
      '/teams/' || NEW.team_id,
      jsonb_build_object('team_id', NEW.team_id, 'session_id', NEW.id)
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_training_session_created
AFTER INSERT ON training_sessions
FOR EACH ROW
EXECUTE FUNCTION notify_training_session();

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;