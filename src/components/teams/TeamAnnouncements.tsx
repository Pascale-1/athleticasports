import { useState } from "react";
import { AnnouncementCard } from "./AnnouncementCard";
import { CreateAnnouncement } from "./CreateAnnouncement";
import { TeamAnnouncement } from "@/hooks/useTeamAnnouncements";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TeamAnnouncementsProps {
  announcements: TeamAnnouncement[];
  canPost: boolean;
  canManage: boolean;
  currentUserId: string | null;
  onPost: (content: string) => void;
  onTogglePin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => void;
}

const MAX_REGULAR_ANNOUNCEMENTS = 5;

export const TeamAnnouncements = ({
  announcements,
  canPost,
  canManage,
  currentUserId,
  onPost,
  onTogglePin,
  onDelete,
}: TeamAnnouncementsProps) => {
  const [showAll, setShowAll] = useState(false);
  
  const pinnedAnnouncements = announcements.filter((a) => a.is_pinned);
  const allRegularAnnouncements = announcements.filter((a) => !a.is_pinned);
  const hasMoreAnnouncements = allRegularAnnouncements.length > MAX_REGULAR_ANNOUNCEMENTS;
  const displayedRegular = showAll 
    ? allRegularAnnouncements 
    : allRegularAnnouncements.slice(0, MAX_REGULAR_ANNOUNCEMENTS);

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
        {pinnedAnnouncements.length > 0 && displayedRegular.length > 0 && (
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Recent Announcements
          </h3>
        )}
        {displayedRegular.map((announcement) => (
          <AnnouncementCard
            key={announcement.id}
            announcement={announcement}
            canManage={canManage}
            canEdit={currentUserId === announcement.posted_by}
            onTogglePin={onTogglePin}
            onDelete={onDelete}
          />
        ))}
        
        {hasMoreAnnouncements && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="w-full text-muted-foreground"
          >
            {showAll ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                View all {allRegularAnnouncements.length} announcements
              </>
            )}
          </Button>
        )}
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
