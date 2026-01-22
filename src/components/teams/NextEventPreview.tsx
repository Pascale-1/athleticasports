import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Event, formatEventDate } from "@/lib/events";
import { useEventAttendance } from "@/hooks/useEventAttendance";
import { useTranslation } from "react-i18next";

interface NextEventPreviewProps {
  event: Event | null;
  teamId: string;
  canRSVP: boolean;
}

export const NextEventPreview = ({ event, teamId, canRSVP }: NextEventPreviewProps) => {
  const { t } = useTranslation(['events', 'common']);
  const { userStatus, stats, updateAttendance } = useEventAttendance(event?.id || null);

  if (!event) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-body-large font-semibold">{t('events:preview.nextEvent')}</h3>
            <Link to={`/teams/${teamId}/events`}>
              <Button variant="ghost" size="sm" className="text-primary">
                {t('events:preview.viewAll')} <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <p className="text-caption text-muted-foreground text-center py-4">
            {t('events:preview.noUpcoming')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-body-large font-semibold">{t('events:preview.nextEvent')}</h3>
          <Link to={`/teams/${teamId}/events`}>
            <Button variant="ghost" size="sm" className="text-primary">
              {t('events:preview.viewAll')} <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        <Link to={`/events/${event.id}`}>
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-body">{event.title}</h4>
              <Badge variant="secondary" className="text-caption shrink-0">
                {t(`events:types.${event.type}`)}
              </Badge>
            </div>

            <div className="space-y-2 text-caption text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatEventDate(event.start_time)}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="line-clamp-1">{event.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{t('events:rsvp.count', { count: stats.attending })}</span>
              </div>
            </div>

            {canRSVP && (
              <div className="grid grid-cols-3 gap-2 pt-2">
                <Button
                  size="sm"
                  variant={userStatus === 'attending' ? 'default' : 'outline'}
                  onClick={(e) => {
                    e.preventDefault();
                    updateAttendance('attending');
                  }}
                  className="text-xs"
                >
                  {t('events:rsvp.going')}
                </Button>
                <Button
                  size="sm"
                  variant={userStatus === 'maybe' ? 'default' : 'outline'}
                  onClick={(e) => {
                    e.preventDefault();
                    updateAttendance('maybe');
                  }}
                  className="text-xs"
                >
                  {t('events:rsvp.maybe')}
                </Button>
                <Button
                  size="sm"
                  variant={userStatus === 'not_attending' ? 'default' : 'outline'}
                  onClick={(e) => {
                    e.preventDefault();
                    updateAttendance('not_attending');
                  }}
                  className="text-xs"
                >
                  {t('events:rsvp.notGoing')}
                </Button>
              </div>
            )}
          </div>
        </Link>
      </CardContent>
    </Card>
  );
};