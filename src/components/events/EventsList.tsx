import { Event } from "@/lib/events";
import { EventCard } from "./EventCard";
import { EmptyState } from "@/components/EmptyState";
import { Calendar } from "lucide-react";
import { useEventAttendance } from "@/hooks/useEventAttendance";

interface EventsListProps {
  events: Event[];
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
        />
      ))}
    </div>
  );
};

const EventCardWithAttendance = ({ 
  event,
  showInlineRSVP,
  isOrganizerView
}: { 
  event: Event;
  showInlineRSVP?: boolean;
  isOrganizerView?: boolean;
}) => {
  const { stats, userStatus, updateAttendance } = useEventAttendance(event.id);

  return (
    <EventCard
      event={event}
      attendeeCount={stats.attending}
      userStatus={userStatus as 'attending' | 'maybe' | 'not_attending' | null}
      showInlineRSVP={showInlineRSVP}
      onRSVPChange={updateAttendance}
      isOrganizerView={isOrganizerView}
    />
  );
};
