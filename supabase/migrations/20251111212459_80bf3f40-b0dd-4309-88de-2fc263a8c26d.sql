-- Create team_messages table for chat functionality
CREATE TABLE team_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_edited BOOLEAN DEFAULT false,
  replied_to_id UUID REFERENCES team_messages(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_team_messages_team_id ON team_messages(team_id);
CREATE INDEX idx_team_messages_created_at ON team_messages(created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE team_messages;

-- RLS Policies
ALTER TABLE team_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view messages"
  ON team_messages FOR SELECT
  USING (is_team_member(auth.uid(), team_id));

CREATE POLICY "Team members can post messages"
  ON team_messages FOR INSERT
  WITH CHECK (
    is_team_member(auth.uid(), team_id) 
    AND auth.uid() = user_id
  );

CREATE POLICY "Users can update their own messages"
  ON team_messages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
  ON team_messages FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_team_messages_updated_at
  BEFORE UPDATE ON team_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();