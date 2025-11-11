import { Event } from "@/lib/events";
import { EventCard } from "./EventCard";
import { EmptyState } from "@/components/EmptyState";
import { Calendar } from "lucide-react";
import { useEventAttendance } from "@/hooks/useEventAttendance";

interface EventsListProps {
  events: Event[];
  emptyTitle?: string;
  emptyDescription?: string;
  variant?: 'default' | 'compact';
  showInlineRSVP?: boolean;
}

export const EventsList = ({ 
  events, 
  emptyTitle = "No events yet",
  emptyDescription = "Create your first event to get started",
  variant = 'default',
  showInlineRSVP = false
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
    <div className={variant === 'compact' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'space-y-3'}>
      {events.map((event) => (
        <EventCardWithAttendance 
          key={event.id} 
          event={event} 
          variant={variant}
          showInlineRSVP={showInlineRSVP}
        />
      ))}
    </div>
  );
};

const EventCardWithAttendance = ({ 
  event, 
  variant,
  showInlineRSVP 
}: { 
  event: Event;
  variant?: 'default' | 'compact';
  showInlineRSVP?: boolean;
}) => {
  const { stats, userStatus, updateAttendance } = useEventAttendance(event.id);

  return (
    <EventCard
      event={event}
      attendeeCount={stats.attending}
      userStatus={userStatus as 'attending' | 'maybe' | 'not_attending' | null}
      variant={variant}
      showInlineRSVP={showInlineRSVP}
      onRSVPChange={updateAttendance}
    />
  );
};
