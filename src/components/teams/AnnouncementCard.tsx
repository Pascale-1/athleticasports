import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pin, Trash2 } from "lucide-react";
import { TeamAnnouncement } from "@/hooks/useTeamAnnouncements";
import { formatDistanceToNow } from "date-fns";

interface AnnouncementCardProps {
  announcement: TeamAnnouncement;
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
  return (
    <Card className={`p-4 ${announcement.is_pinned ? "border-primary" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <Avatar className="h-10 w-10">
            <AvatarImage src={announcement.profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {announcement.profile?.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium">@{announcement.profile?.username}</p>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
              </span>
              {announcement.is_pinned && (
                <Pin className="h-4 w-4 text-primary" />
              )}
            </div>
            <p className="text-sm whitespace-pre-wrap">{announcement.content}</p>
          </div>
        </div>
        {(canManage || canEdit) && (
          <div className="flex gap-1">
            {canManage && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onTogglePin(announcement.id, announcement.is_pinned)}
                className={announcement.is_pinned ? "text-primary" : ""}
              >
                <Pin className="h-4 w-4" />
              </Button>
            )}
            {(canManage || canEdit) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(announcement.id)}
                className="text-destructive hover:text-destructive"
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
