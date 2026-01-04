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

const MESSAGES_PER_PAGE = 50;

export const useTeamChat = (teamId: string | null) => {
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

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
      // Get total count first
      const { count } = await supabase
        .from('team_messages_with_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', teamId);

      // Fetch latest messages (descending to get newest first, then reverse for display)
      const { data, error } = await supabase
        .from('team_messages_with_profiles')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })
        .limit(MESSAGES_PER_PAGE);

      if (error) throw error;
      
      // Transform and reverse for chronological display (oldest first)
      const transformedMessages = (data || []).reverse().map((msg: any) => ({
        id: msg.id,
        team_id: msg.team_id,
        user_id: msg.user_id,
        content: msg.content,
        created_at: msg.created_at,
        updated_at: msg.updated_at,
        is_edited: msg.is_edited,
        replied_to_id: msg.replied_to_id,
        profiles: {
          username: msg.username,
          display_name: msg.display_name,
          avatar_url: msg.avatar_url
        }
      }));
      
      setMessages(transformedMessages);
      setHasMore((count || 0) > MESSAGES_PER_PAGE);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!teamId || messages.length === 0 || loadingMore) return;

    setLoadingMore(true);
    try {
      const oldestMessage = messages[0];
      
      const { data, error } = await supabase
        .from('team_messages_with_profiles')
        .select('*')
        .eq('team_id', teamId)
        .lt('created_at', oldestMessage.created_at)
        .order('created_at', { ascending: false })
        .limit(MESSAGES_PER_PAGE);

      if (error) throw error;
      
      const transformedMessages = (data || []).reverse().map((msg: any) => ({
        id: msg.id,
        team_id: msg.team_id,
        user_id: msg.user_id,
        content: msg.content,
        created_at: msg.created_at,
        updated_at: msg.updated_at,
        is_edited: msg.is_edited,
        replied_to_id: msg.replied_to_id,
        profiles: {
          username: msg.username,
          display_name: msg.display_name,
          avatar_url: msg.avatar_url
        }
      }));
      
      // Prepend older messages
      setMessages(prev => [...transformedMessages, ...prev]);
      setHasMore((data || []).length === MESSAGES_PER_PAGE);
    } catch (error) {
      console.error('Error loading more messages:', error);
      toast.error("Failed to load earlier messages");
    } finally {
      setLoadingMore(false);
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

      // Immediately refetch to show the new message
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      // Optimistic update - remove message immediately from UI
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      const { error } = await supabase
        .from('team_messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        // Revert on error by refetching
        fetchMessages();
        throw error;
      }
      toast.success("Message deleted");
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error("Failed to delete message");
    }
  };

  return { messages, loading, loadingMore, hasMore, loadMoreMessages, sendMessage, deleteMessage };
};
