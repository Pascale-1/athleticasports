import { Event } from "@/lib/events";
import { EventCard } from "./EventCard";
import { EmptyState } from "@/components/EmptyState";
import { Calendar } from "lucide-react";
import { useEventAttendance } from "@/hooks/useEventAttendance";

// Extended event type that includes pre-fetched user status
interface EventWithUserStatus extends Event {
  userStatus?: 'attending' | 'maybe' | 'not_attending' | null;
  attendingCount?: number;
  maybeCount?: number;
}

interface EventsListProps {
  events: EventWithUserStatus[];
  emptyTitle?: string;
  emptyDescription?: string;
  showInlineRSVP?: boolean;
  isOrganizerView?: boolean;
}

export const EventsList = ({ 
  events, 
  emptyTitle = "No events yet",
  emptyDescription = "Create your first event to get started",
  showInlineRSVP = false,
  isOrganizerView = false
}: EventsListProps) => {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <EventCardWithAttendance 
          key={event.id} 
          event={event}
          showInlineRSVP={showInlineRSVP}
          isOrganizerView={isOrganizerView}
          prefetchedUserStatus={event.userStatus}
          prefetchedAttendingCount={event.attendingCount}
        />
      ))}
    </div>
  );
};

const EventCardWithAttendance = ({ 
  event,
  showInlineRSVP,
  isOrganizerView,
  prefetchedUserStatus,
  prefetchedAttendingCount
}: { 
  event: Event;
  showInlineRSVP?: boolean;
  isOrganizerView?: boolean;
  prefetchedUserStatus?: 'attending' | 'maybe' | 'not_attending' | null;
  prefetchedAttendingCount?: number;
}) => {
  const { stats, userStatus, updateAttendance } = useEventAttendance(event.id);

  // Use prefetched values if available, otherwise fall back to hook values
  const finalUserStatus = prefetchedUserStatus !== undefined ? prefetchedUserStatus : userStatus;
  const finalAttendeeCount = prefetchedAttendingCount !== undefined ? prefetchedAttendingCount : stats.attending;

  return (
    <EventCard
      event={event}
      attendeeCount={finalAttendeeCount}
      userStatus={finalUserStatus as 'attending' | 'maybe' | 'not_attending' | null}
      showInlineRSVP={showInlineRSVP}
      onRSVPChange={updateAttendance}
      isOrganizerView={isOrganizerView}
    />
  );
};
