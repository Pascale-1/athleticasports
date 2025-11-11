import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Event } from "@/lib/events";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay } from "date-fns";
import { EventCard } from "./EventCard";
import { useEventAttendance } from "@/hooks/useEventAttendance";

interface EventCalendarProps {
  events: Event[];
}

export const EventCalendar = ({ events }: EventCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Get dates that have events
  const eventDates = events.map(event => new Date(event.start_time));

  // Filter events for selected date
  const eventsForSelectedDate = selectedDate
    ? events.filter(event => isSameDay(new Date(event.start_time), selectedDate))
    : [];

  return (
    <div className="grid lg:grid-cols-[350px,1fr] gap-6">
      {/* Calendar */}
      <Card className="p-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="pointer-events-auto"
          modifiers={{
            hasEvent: (date) => eventDates.some(eventDate => isSameDay(eventDate, date))
          }}
          modifiersStyles={{
            hasEvent: {
              fontWeight: 'bold',
              position: 'relative',
            }
          }}
        />
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span>Has events</span>
          </div>
        </div>
      </Card>

      {/* Events List for Selected Date */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">
            {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
          </h3>
          {eventsForSelectedDate.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {eventsForSelectedDate.length} {eventsForSelectedDate.length === 1 ? 'event' : 'events'}
            </p>
          )}
        </div>

        <div className="space-y-3">
          {eventsForSelectedDate.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No events scheduled for this date</p>
            </Card>
          ) : (
            eventsForSelectedDate.map((event) => (
              <EventCardWithAttendance key={event.id} event={event} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const EventCardWithAttendance = ({ event }: { event: Event }) => {
  const { stats, userStatus } = useEventAttendance(event.id);

  return (
    <EventCard
      event={event}
      attendeeCount={stats.attending}
      userStatus={userStatus as 'attending' | 'maybe' | 'not_attending' | null}
    />
  );
};
