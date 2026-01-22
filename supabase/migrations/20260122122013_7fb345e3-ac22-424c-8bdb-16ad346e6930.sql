-- Create account deletion requests table for email confirmation flow
CREATE TABLE public.account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  confirmation_token UUID DEFAULT gen_random_uuid() UNIQUE,
  language TEXT NOT NULL DEFAULT 'fr',
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Users can only view their own deletion requests
CREATE POLICY "Users can view own deletion requests" 
  ON public.account_deletion_requests 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can create their own deletion requests
CREATE POLICY "Users can create own deletion requests" 
  ON public.account_deletion_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create index for token lookups
CREATE INDEX idx_account_deletion_token ON public.account_deletion_requests(confirmation_token);

-- Create index for cleanup of expired requests
CREATE INDEX idx_account_deletion_expires ON public.account_deletion_requests(expires_at);