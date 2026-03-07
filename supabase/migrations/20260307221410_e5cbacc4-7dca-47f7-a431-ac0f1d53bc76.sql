
-- Drop web push columns and add native push columns
ALTER TABLE public.push_subscriptions DROP COLUMN IF EXISTS endpoint;
ALTER TABLE public.push_subscriptions DROP COLUMN IF EXISTS p256dh;
ALTER TABLE public.push_subscriptions DROP COLUMN IF EXISTS auth;

ALTER TABLE public.push_subscriptions ADD COLUMN device_token text NOT NULL;
ALTER TABLE public.push_subscriptions ADD COLUMN platform text NOT NULL DEFAULT 'android';

ALTER TABLE public.push_subscriptions ADD CONSTRAINT push_subscriptions_device_token_key UNIQUE (device_token);

-- Add UPDATE policy for upsert support
CREATE POLICY "Users can update own subscriptions"
  ON public.push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);
