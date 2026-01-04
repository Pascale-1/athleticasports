import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Event } from "@/lib/events";
import { format, isSameDay } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { EventCard } from "./EventCard";
import { useEventAttendance } from "@/hooks/useEventAttendance";

interface EventCalendarProps {
  events: Event[];
}

export const EventCalendar = ({ events }: EventCalendarProps) => {
  const { t, i18n } = useTranslation('events');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Get locale for date formatting
  const locale = i18n.language === 'fr' ? fr : enUS;

  // Get dates that have events
  const eventDates = events.map(event => new Date(event.start_time));

  // Filter events for selected date
  const eventsForSelectedDate = selectedDate
    ? events.filter(event => isSameDay(new Date(event.start_time), selectedDate))
    : [];

  return (
    <div className="space-y-4 lg:grid lg:grid-cols-[350px,1fr] lg:gap-6 lg:space-y-0">
      {/* Calendar - Full width on mobile */}
      <Card className="p-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={locale}
          className="pointer-events-auto mx-auto"
          modifiers={{
            hasEvent: (date) => eventDates.some(eventDate => isSameDay(eventDate, date))
          }}
          modifiersStyles={{
            hasEvent: {
              fontWeight: 'bold',
            }
          }}
        />
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span>{t('calendar.hasEvents')}</span>
          </div>
        </div>
      </Card>

      {/* Events List for Selected Date */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">
            {selectedDate ? format(selectedDate, 'PPP', { locale }) : t('calendar.selectDate')}
          </h3>
          {eventsForSelectedDate.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {t('calendar.eventCount', { count: eventsForSelectedDate.length })}
            </p>
          )}
        </div>

        <div className="space-y-3">
          {eventsForSelectedDate.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">{t('calendar.noEventsOnDate')}</p>
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
