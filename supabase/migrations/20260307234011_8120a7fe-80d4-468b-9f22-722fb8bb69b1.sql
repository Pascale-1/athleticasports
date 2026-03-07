
-- Analytics events table for tracking user actions
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_name text NOT NULL,
  event_category text NOT NULL DEFAULT 'general',
  metadata jsonb DEFAULT '{}'::jsonb,
  page_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for fast querying
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events (created_at DESC);
CREATE INDEX idx_analytics_events_event_name ON public.analytics_events (event_name);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events (user_id);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own events
CREATE POLICY "Users can insert own analytics events"
  ON public.analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Only admins can read analytics events
CREATE POLICY "Admins can view all analytics events"
  ON public.analytics_events FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));
