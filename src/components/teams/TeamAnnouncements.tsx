import { AnnouncementCard } from "./AnnouncementCard";
import { CreateAnnouncement } from "./CreateAnnouncement";
import { TeamAnnouncement } from "@/hooks/useTeamAnnouncements";

interface TeamAnnouncementsProps {
  announcements: TeamAnnouncement[];
  canPost: boolean;
  canManage: boolean;
  currentUserId: string | null;
  onPost: (content: string) => void;
  onTogglePin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => void;
}

export const TeamAnnouncements = ({
  announcements,
  canPost,
  canManage,
  currentUserId,
  onPost,
  onTogglePin,
  onDelete,
}: TeamAnnouncementsProps) => {
  const pinnedAnnouncements = announcements.filter((a) => a.is_pinned);
  const regularAnnouncements = announcements.filter((a) => !a.is_pinned);

  return (
    <div className="space-y-6">
      {canPost && <CreateAnnouncement onPost={onPost} />}

      {pinnedAnnouncements.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Pinned Announcements
          </h3>
          {pinnedAnnouncements.map((announcement) => (
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

      <div className="space-y-3">
        {pinnedAnnouncements.length > 0 && (
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Recent Announcements
          </h3>
        )}
        {regularAnnouncements.map((announcement) => (
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

      {announcements.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No announcements yet.</p>
          {canPost && <p className="text-sm mt-2">Be the first to post!</p>}
        </div>
      )}
    </div>
  );
};
