import { useState } from "react";
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
import { getEventTypeKey, EventType } from "@/lib/eventConfig";

interface EventsPreviewProps {
  events: Event[];
  teamId: string;
  canRSVP: boolean;
}

type FilterType = 'all' | 'training' | 'match' | 'meetup';

export const EventsPreview = ({ events, teamId, canRSVP }: EventsPreviewProps) => {
  const { t } = useTranslation(['events', 'common']);
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.type === filter);
  const displayedEvents = filteredEvents.slice(0, 3);

  const trainingCount = events.filter(e => e.type === 'training').length;
  const matchCount = events.filter(e => e.type === 'match').length;

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

        {/* Filter tabs */}
        {(trainingCount > 0 || matchCount > 0) && (
          <div className="flex gap-1.5 mb-3">
            {(['all', 'training', 'match', 'meetup'] as FilterType[]).map((type) => {
              const count = type === 'all' ? events.length : events.filter(e => e.type === type).length;
              if (type !== 'all' && count === 0) return null;
              const labels: Record<FilterType, string> = {
                all: t('common:filters.all', 'All'),
                training: '🏋️ ' + t('events:types.training', 'Training'),
                match: '⚽ ' + t('events:types.match', 'Match'),
                meetup: '👥 ' + t('events:types.meetup', 'Meetup'),
              };
              return (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all",
                    filter === type
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {labels[type]} ({count})
                </button>
              );
            })}
          </div>
        )}

        <div className="space-y-3">
          {displayedEvents.map((event) => (
            <EventPreviewCard
              key={event.id}
              event={event}
              canRSVP={canRSVP}
            />
          ))}
          {filteredEvents.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-4">
              {t('events:preview.noUpcoming')}
            </p>
          )}
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
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400';
      case 'match':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400';
      case 'meetup':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'training': return '🏋️';
      case 'match': return '⚽';
      case 'meetup': return '👥';
      default: return '📅';
    }
  };

  return (
    <div className="border border-border rounded-lg p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={cn("text-[10px]", getEventTypeColor(event.type))}>
              {getEventTypeIcon(event.type)} {t(`types.${getEventTypeKey(event.type as EventType)}`)}
            </Badge>
            {event.is_recurring && (
              <Flame className="h-3 w-3 text-primary" />
            )}
          </div>
          <Link to={`/events/${event.id}`}>
            <h4 className="text-caption font-semibold truncate hover:text-primary transition-colors">
              {event.title}
            </h4>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-3 text-[11px] text-muted-foreground min-w-0">
        <div className="flex items-center gap-1 shrink-0">
          <Calendar className="h-3 w-3 shrink-0" />
          <span>{formatEventDate(event.start_time)}</span>
        </div>
        {event.location && (
          <div className="flex items-center gap-1 min-w-0 max-w-[120px]">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        )}
        <div className="flex items-center gap-1 ml-auto shrink-0">
          <Users className="h-3 w-3 shrink-0" />
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
