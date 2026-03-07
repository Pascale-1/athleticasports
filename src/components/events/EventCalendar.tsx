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

  const locale = i18n.language === 'fr' ? fr : enUS;
  const eventDates = events.map(event => new Date(event.start_time));

  const eventsForSelectedDate = selectedDate
    ? events.filter(event => isSameDay(new Date(event.start_time), selectedDate))
    : [];

  return (
    <div className="space-y-3">
      <Card className="p-4">
        <div className="flex flex-col items-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={locale}
            className="pointer-events-auto"
            modifiers={{
              hasEvent: (date) => eventDates.some(eventDate => isSameDay(eventDate, date))
            }}
            modifiersClassNames={{
              hasEvent: "has-event-indicator"
            }}
          />
          <div className="mt-3 pt-3 border-t w-full">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span>{t('calendar.hasEvents')}</span>
            </div>
          </div>
        </div>
      </Card>

      <div>
        <div className="mb-3 text-center">
          <h3 className="text-base font-semibold">
            {selectedDate ? format(selectedDate, 'PPP', { locale }) : t('calendar.selectDate')}
          </h3>
          {eventsForSelectedDate.length > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {t('calendar.eventCount', { count: eventsForSelectedDate.length })}
            </p>
          )}
        </div>

        <div className="space-y-2">
          {eventsForSelectedDate.length === 0 ? (
            <Card className="p-6 text-center">
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
