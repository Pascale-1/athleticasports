import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";

interface CreateAnnouncementProps {
  onPost: (content: string) => void;
}

export const CreateAnnouncement = ({ onPost }: CreateAnnouncementProps) => {
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onPost(content.trim());
      setContent("");
      setIsExpanded(false);
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit}>
        {!isExpanded ? (
          <div
            className="flex items-center gap-2 cursor-pointer text-muted-foreground"
            onClick={() => setIsExpanded(true)}
          >
            <MessageSquare className="h-5 w-5" />
            <span>Share an announcement with your team...</span>
          </div>
        ) : (
          <div className="space-y-3">
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px]"
              maxLength={2000}
              autoFocus
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {content.length}/2000
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setContent("");
                    setIsExpanded(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!content.trim()}>
                  Post
                </Button>
              </div>
            </div>
          </div>
        )}
      </form>
    </Card>
  );
};
