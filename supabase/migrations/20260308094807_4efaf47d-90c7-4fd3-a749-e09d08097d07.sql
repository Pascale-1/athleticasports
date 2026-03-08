
CREATE OR REPLACE FUNCTION public.notify_team_chat_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  member RECORD;
  team_name TEXT;
  sender_name TEXT;
  msg_preview TEXT;
BEGIN
  SELECT name INTO team_name FROM teams WHERE id = NEW.team_id;
  SELECT COALESCE(display_name, username) INTO sender_name
    FROM profiles WHERE user_id = NEW.user_id;

  msg_preview := LEFT(NEW.content, 80);
  IF LENGTH(NEW.content) > 80 THEN
    msg_preview := msg_preview || '…';
  END IF;

  FOR member IN
    SELECT user_id FROM team_members
    WHERE team_id = NEW.team_id
      AND status = 'active'
      AND user_id != NEW.user_id
  LOOP
    INSERT INTO notifications (user_id, type, title, message, link, metadata)
    VALUES (
      member.user_id,
      'team_announcement',
      team_name || ' – New Message',
      sender_name || ': ' || msg_preview,
      '/teams/' || NEW.team_id || '?tab=chat',
      jsonb_build_object('team_id', NEW.team_id, 'message_id', NEW.id, 'sender_id', NEW.user_id)
    );
  END LOOP;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'notify_team_chat_message failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_team_message_inserted
  AFTER INSERT ON public.team_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_team_chat_message();
