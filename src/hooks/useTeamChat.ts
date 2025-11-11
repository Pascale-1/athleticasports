import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TeamMessage {
  id: string;
  team_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  replied_to_id: string | null;
  profiles?: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export const useTeamChat = (teamId: string | null) => {
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    fetchMessages();

    // Realtime subscription
    const channel = supabase
      .channel(`team-chat-${teamId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_messages',
          filter: `team_id=eq.${teamId}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId]);

  const fetchMessages = async () => {
    if (!teamId) return;

    try {
      const { data, error } = await supabase
        .from('team_messages')
        .select(`
          *,
          profiles!team_messages_user_id_fkey (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data as any) || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!teamId || !content.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from('team_messages').insert({
        team_id: teamId,
        user_id: user.id,
        content: content.trim(),
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('team_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
      toast.success("Message deleted");
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error("Failed to delete message");
    }
  };

  return { messages, loading, sendMessage, deleteMessage };
};
