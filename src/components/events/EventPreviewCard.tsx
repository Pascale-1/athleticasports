import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Dumbbell, Users, Trophy, MapPin, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { EventType } from "@/lib/eventConfig";

interface EventPreviewCardProps {
  type: EventType;
  title: string;
  date: Date | undefined;
  startTime: string;
  location: string;
  maxParticipants: string;
  opponentName?: string;
  category?: string;
}

const TYPE_CONFIG: Record<EventType, { icon: typeof Trophy; bgClass: string; colorClass: string }> = {
  match: { icon: Trophy, bgClass: 'bg-amber-500/10', colorClass: 'text-amber-500' },
  training: { icon: Dumbbell, bgClass: 'bg-primary/10', colorClass: 'text-primary' },
  meetup: { icon: Users, bgClass: 'bg-green-500/10', colorClass: 'text-green-500' },
};

export const EventPreviewCard = ({
  type,
  title,
  date,
  startTime,
  location,
  maxParticipants,
  opponentName,
  category,
}: EventPreviewCardProps) => {
  const { t } = useTranslation('events');
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  const displayTitle = title || t('form.titlePlaceholder');
  const displayDate = date ? format(date, 'EEE, MMM d') : t('form.pickDate');
  const displayTime = startTime || '--:--';

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {t('form.preview')}
      </p>
      <Card className="p-4 border-dashed border-2 bg-muted/20">
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
            config.bgClass
          )}>
            <Icon className={cn("h-6 w-6", config.colorClass)} />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <p className={cn(
              "font-semibold truncate",
              !title && "text-muted-foreground italic"
            )}>
              {displayTitle}
            </p>
            {type === 'match' && opponentName && (
              <p className="text-sm text-muted-foreground">vs {opponentName}</p>
            )}
            {type === 'meetup' && category && (
              <p className="text-sm text-muted-foreground">{category}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {displayDate} • {displayTime}
              </span>
            </div>
            {location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{location}</span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-dashed">
          <p className="text-xs text-muted-foreground">
            {t('rsvp.count', { count: 0 })} • {maxParticipants ? `${maxParticipants} max` : t('form.maxParticipants')}
          </p>
        </div>
      </Card>
    </div>
  );
};
