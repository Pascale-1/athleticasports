import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pin, Trash2, Bot, ExternalLink } from "lucide-react";
import { TeamAnnouncement } from "@/hooks/useTeamAnnouncements";
import { formatAbsoluteTimestamp } from "@/lib/dateUtils";
import { useNavigate } from "react-router-dom";

const renderSimpleMarkdown = (text: string) => {
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escaped
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.*?)_/g, '<em>$1</em>');
};

const isSystemUser = (username?: string) => {
  return username?.match(/^user_[a-f0-9]{6,}$/);
};

interface AnnouncementCardProps {
  announcement: TeamAnnouncement & { event_id?: string | null };
  canManage: boolean;
  canEdit: boolean;
  onTogglePin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => void;
}

export const AnnouncementCard = ({
  announcement,
  canManage,
  canEdit,
  onTogglePin,
  onDelete,
}: AnnouncementCardProps) => {
  const navigate = useNavigate();
  const hasEvent = !!(announcement as any).event_id;

  const handleCardClick = () => {
    if (hasEvent) {
      navigate(`/events/${(announcement as any).event_id}`);
    }
  };

  return (
    <Card 
      className={`p-3 sm:p-4 ${announcement.is_pinned ? "border-primary" : ""} ${hasEvent ? "cursor-pointer hover:bg-muted/30 transition-colors" : ""}`}
      onClick={hasEvent ? handleCardClick : undefined}
    >
      <div className="flex flex-col sm:flex-row items-start gap-3">
        <div className="flex items-start gap-2 sm:gap-3 flex-1 w-full min-w-0">
          {isSystemUser(announcement.profile?.username) ? (
            <div className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </div>
          ) : (
            <Avatar className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
              <AvatarImage src={announcement.profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {announcement.profile?.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
              <p className="font-medium text-sm sm:text-base truncate">
                {isSystemUser(announcement.profile?.username) ? 'Athletica' : `@${announcement.profile?.username}`}
              </p>
              <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                {formatAbsoluteTimestamp(announcement.created_at)}
              </span>
              {announcement.is_pinned && (
                <Pin className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
              )}
              {hasEvent && (
                <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              )}
            </div>
            <p className="text-xs sm:text-sm whitespace-pre-wrap break-words"
               dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(announcement.content) }} />
          </div>
        </div>
        {(canManage || canEdit) && (
          <div className="flex gap-1 w-full sm:w-auto justify-end" onClick={(e) => e.stopPropagation()}>
            {canManage && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onTogglePin(announcement.id, announcement.is_pinned)}
                className={`min-h-11 min-w-11 ${announcement.is_pinned ? "text-primary" : ""}`}
              >
                <Pin className="h-4 w-4" />
              </Button>
            )}
            {(canManage || canEdit) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(announcement.id)}
                className="text-destructive hover:text-destructive min-h-11 min-w-11"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
