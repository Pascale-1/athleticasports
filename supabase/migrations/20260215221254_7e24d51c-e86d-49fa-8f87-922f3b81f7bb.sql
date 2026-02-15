
-- Add cost and payment fields to events table
ALTER TABLE public.events ADD COLUMN cost text NULL;
ALTER TABLE public.events ADD COLUMN payment_link text NULL;
ALTER TABLE public.events ADD COLUMN payment_method text NULL;
