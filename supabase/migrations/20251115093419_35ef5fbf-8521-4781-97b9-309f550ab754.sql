-- Enable realtime for activities table
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;

-- Enable realtime for events table
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;

-- Enable realtime for user_goals table
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_goals;

-- Enable realtime for profiles table
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Enable realtime for user_activity_log table
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_activity_log;