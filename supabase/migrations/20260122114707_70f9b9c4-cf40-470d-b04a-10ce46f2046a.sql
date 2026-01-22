-- Drop the overly permissive policy
DROP POLICY IF EXISTS "System can create proposals" ON public.match_proposals;

-- Create a proper policy that only allows authenticated users to create proposals for themselves
CREATE POLICY "Users can create their own proposals"
ON public.match_proposals
FOR INSERT
WITH CHECK (auth.uid() = player_user_id);