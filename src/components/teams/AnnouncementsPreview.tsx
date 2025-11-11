import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Pin } from "lucide-react";
import { Link } from "react-router-dom";
import { AnnouncementCard } from "./AnnouncementCard";
import { CreateAnnouncement } from "./CreateAnnouncement";
import { TeamAnnouncement } from "@/hooks/useTeamAnnouncements";

interface AnnouncementsPreviewProps {
  announcements: TeamAnnouncement[];
  canPost: boolean;
  canManage: boolean;
  currentUserId: string | null;
  onPost: (content: string) => void;
  onTogglePin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => void;
  teamId: string;
}

export const AnnouncementsPreview = ({ 
  announcements, 
  canPost,
  canManage,
  currentUserId,
  onPost, 
  onTogglePin,
  onDelete,
  teamId 
}: AnnouncementsPreviewProps) => {
  const pinnedAnnouncements = announcements.filter(a => a.is_pinned);
  const recentAnnouncements = announcements
    .filter(a => !a.is_pinned)
    .slice(0, 2);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-body-large font-semibold">Announcements</h3>
          <Link to={`/teams/${teamId}?tab=announcements`}>
            <Button variant="ghost" size="sm" className="text-primary">
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {canPost && <CreateAnnouncement onPost={onPost} />}

          {pinnedAnnouncements.length > 0 && (
            <div className="space-y-2">
              {pinnedAnnouncements.slice(0, 1).map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  canManage={canManage}
                  canEdit={currentUserId === announcement.posted_by}
                  onTogglePin={onTogglePin}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}

          {recentAnnouncements.length > 0 ? (
            <div className="space-y-2">
              {recentAnnouncements.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  canManage={canManage}
                  canEdit={currentUserId === announcement.posted_by}
                  onTogglePin={onTogglePin}
                  onDelete={onDelete}
                />
              ))}
            </div>
          ) : !canPost && pinnedAnnouncements.length === 0 && (
            <p className="text-caption text-muted-foreground text-center py-4">
              No announcements yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
