import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, MapPin, Users, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { Event } from "@/lib/events";
import { useEventAttendance } from "@/hooks/useEventAttendance";
import { formatEventDate } from "@/lib/events";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface EventsPreviewProps {
  events: Event[];
  teamId: string;
  canRSVP: boolean;
}

export const EventsPreview = ({ events, teamId, canRSVP }: EventsPreviewProps) => {
  const { t } = useTranslation(['events', 'common']);
  const upcomingEvents = events.slice(0, 3);

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-body-large font-semibold">{t('events:preview.upcomingEvents')}</h3>
          </div>
          <div className="text-center py-6">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-caption text-muted-foreground">{t('events:preview.noUpcoming')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-body-large font-semibold">
            {t('events:preview.upcomingEvents')} ({events.length})
          </h3>
          <Link to={`/teams/${teamId}/events`}>
            <Button variant="ghost" size="sm" className="text-primary">
              {t('events:preview.viewAll')} <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {upcomingEvents.map((event) => (
            <EventPreviewCard
              key={event.id}
              event={event}
              canRSVP={canRSVP}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const EventPreviewCard = ({ event, canRSVP }: { event: Event; canRSVP: boolean }) => {
  const { t } = useTranslation('events');
  const { stats, userStatus, updateAttendance } = useEventAttendance(event.id);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'training':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'match':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'meetup':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="border border-border rounded-lg p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={cn("text-[10px]", getEventTypeColor(event.type))}>
              {t(`types.${event.type}`)}
            </Badge>
            {event.is_recurring && (
              <Flame className="h-3 w-3 text-orange-500" />
            )}
          </div>
          <Link to={`/events/${event.id}`}>
            <h4 className="text-caption font-semibold truncate hover:text-primary transition-colors">
              {event.title}
            </h4>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{formatEventDate(event.start_time)}</span>
        </div>
        {event.location && (
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{event.location}</span>
          </div>
        )}
        <div className="flex items-center gap-1 ml-auto">
          <Users className="h-3 w-3" />
          <span>{t('rsvp.count', { count: stats.attending })}</span>
        </div>
      </div>

      {canRSVP && (
        <div className="flex gap-2 pt-1">
          <Button
            variant={userStatus === 'attending' ? 'default' : 'outline'}
            size="sm"
            className="flex-1 h-7 text-[11px]"
            onClick={() => updateAttendance('attending')}
          >
            {t('rsvp.going')}
          </Button>
          <Button
            variant={userStatus === 'maybe' ? 'default' : 'outline'}
            size="sm"
            className="flex-1 h-7 text-[11px]"
            onClick={() => updateAttendance('maybe')}
          >
            {t('rsvp.maybe')}
          </Button>
          <Button
            variant={userStatus === 'not_attending' ? 'default' : 'outline'}
            size="sm"
            className="flex-1 h-7 text-[11px]"
            onClick={() => updateAttendance('not_attending')}
          >
            {t('rsvp.notGoing')}
          </Button>
        </div>
      )}
    </div>
  );
};