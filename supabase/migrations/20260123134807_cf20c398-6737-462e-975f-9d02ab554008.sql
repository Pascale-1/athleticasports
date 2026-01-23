-- Enable pg_net extension for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create trigger function to match players when a "looking for players" event is created
CREATE OR REPLACE FUNCTION public.trigger_match_on_event_creation()
RETURNS TRIGGER AS $$
DECLARE
  supabase_url TEXT;
  service_key TEXT;
BEGIN
  -- Only trigger for events that are looking for players
  IF NEW.looking_for_players = true THEN
    -- Get secrets from vault
    SELECT decrypted_secret INTO supabase_url 
    FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL' LIMIT 1;
    
    SELECT decrypted_secret INTO service_key 
    FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1;
    
    -- Use pg_net to call the match-players edge function asynchronously
    IF supabase_url IS NOT NULL AND service_key IS NOT NULL THEN
      PERFORM net.http_post(
        url := supabase_url || '/functions/v1/match-players',
        headers := jsonb_build_object(
          'Authorization', 'Bearer ' || service_key,
          'Content-Type', 'application/json'
        ),
        body := jsonb_build_object('event_id', NEW.id::text)
      );
    END IF;
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the insert
  RAISE WARNING 'Failed to trigger match-players: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger
DROP TRIGGER IF EXISTS on_event_created_match_players ON events;
CREATE TRIGGER on_event_created_match_players
  AFTER INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_match_on_event_creation();