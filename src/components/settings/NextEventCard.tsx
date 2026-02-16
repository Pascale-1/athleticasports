import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, ChevronRight, MapPin, Dumbbell, Trophy, Users } from "lucide-react";
import { useUserEvents } from "@/hooks/useUserEvents";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

const eventTypeIcon = (type: string) => {
  switch (type) {
    case 'match': return Trophy;
    case 'training': return Dumbbell;
    case 'meetup': return Users;
    default: return CalendarCheck;
  }
};

const eventTypeColor = (type: string) => {
  switch (type) {
    case 'match': return 'bg-warning/10 text-warning';
    case 'training': return 'bg-info/10 text-info';
    case 'meetup': return 'bg-success/10 text-success';
    default: return 'bg-primary/10 text-primary';
  }
};

export const NextEventCard = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isFr = i18n.language?.startsWith('fr');
  const { events, loading } = useUserEvents({ status: 'upcoming' });

  const nextEvent = events[0];

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-5 pb-4">
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!nextEvent) {
    return (
      <Card>
        <CardContent className="pt-5 pb-4 space-y-3">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">{t('nextEvent.title')}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{t('nextEvent.noEvents')}</p>
          <Button size="sm" variant="outline" className="w-full" onClick={() => navigate("/events")}>
            {t('nextEvent.browseEvents')}
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  const Icon = eventTypeIcon(nextEvent.type);
  const startDate = new Date(nextEvent.start_time);
  const relativeTime = formatDistanceToNow(startDate, {
    addSuffix: true,
    locale: isFr ? fr : undefined,
  });
  const timeStr = format(startDate, "EEEE, HH:mm", { locale: isFr ? fr : undefined });

  return (
    <Card>
      <CardContent className="pt-5 pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">{t('nextEvent.title')}</h3>
          </div>
          <Badge variant="secondary" className="text-[10px]">{relativeTime}</Badge>
        </div>

        <div
          onClick={() => navigate(`/events/${nextEvent.id}`)}
          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors active:scale-[0.99]"
        >
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${eventTypeColor(nextEvent.type)}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm line-clamp-1">{nextEvent.title}</p>
            <p className="text-xs text-muted-foreground capitalize">{timeStr}</p>
            {nextEvent.location && (
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground line-clamp-1">{nextEvent.location}</p>
              </div>
            )}
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
};