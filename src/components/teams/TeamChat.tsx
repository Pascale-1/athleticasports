import { useState, useEffect, useRef } from "react";
import { useTeamChat } from "@/hooks/useTeamChat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TeamChatProps {
  teamId: string;
}

export const TeamChat = ({ teamId }: TeamChatProps) => {
  const { messages, loading, loadingMore, hasMore, loadMoreMessages, sendMessage, deleteMessage } = useTeamChat(teamId);
  const [input, setInput] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  const handleDelete = async () => {
    if (messageToDelete) {
      await deleteMessage(messageToDelete);
      setMessageToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ScrollArea className="min-h-[200px] max-h-[400px] pr-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                onClick={loadMoreMessages}
                disabled={loadingMore}
                className="w-full mb-2"
              >
                {loadingMore ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Load earlier messages
              </Button>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-3 group">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={msg.profiles?.avatar_url || undefined} />
                  <AvatarFallback>
                    {msg.profiles?.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {msg.profiles?.display_name || msg.profiles?.username}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-body break-words">{msg.content}</p>
                </div>
                {currentUserId === msg.user_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                    onClick={() => setMessageToDelete(msg.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="flex-1"
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim()}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <AlertDialog open={!!messageToDelete} onOpenChange={() => setMessageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
