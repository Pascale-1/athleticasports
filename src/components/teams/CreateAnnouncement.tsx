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
    <Card className="p-3 sm:p-4">
      <form onSubmit={handleSubmit}>
        {!isExpanded ? (
          <div
            className="flex items-center gap-2 cursor-pointer text-muted-foreground"
            onClick={() => setIsExpanded(true)}
          >
            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-xs sm:text-sm">Share an announcement with your team...</span>
          </div>
        ) : (
          <div className="space-y-3">
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[80px] sm:min-h-[100px] text-xs sm:text-sm"
              maxLength={2000}
              autoFocus
            />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                {content.length}/2000
              </span>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setContent("");
                    setIsExpanded(false);
                  }}
                  className="flex-1 sm:flex-initial min-h-11"
                >
                  <span className="text-xs sm:text-sm">Cancel</span>
                </Button>
                <Button type="submit" disabled={!content.trim()} className="flex-1 sm:flex-initial min-h-11">
                  <span className="text-xs sm:text-sm">Post</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </form>
    </Card>
  );
};
