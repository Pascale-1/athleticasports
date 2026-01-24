import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DateBlock } from "@/components/ui/date-block";
import { AvatarStack } from "@/components/ui/avatar-stack";
import { StatusPill } from "@/components/ui/status-pill";
import { 
  MapPin, 
  Clock, 
  UserPlus, 
  Repeat,
  MoreVertical,
  Pencil,
  Trash2
} from "lucide-react";
import { Event } from "@/lib/events";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface EventCardProps {
  event: Event & { 
    looking_for_players?: boolean; 
    players_needed?: number | null;
    parent_event_id?: string | null;
    is_recurring?: boolean;
    recurrence_rule?: string | null;
    pendingRequestsCount?: number;
  };
  onAttendanceClick?: () => void;
  attendeeCount?: number;
  userStatus?: 'attending' | 'maybe' | 'not_attending' | null;
  showInlineRSVP?: boolean;
  onRSVPChange?: (status: 'attending' | 'maybe' | 'not_attending') => void;
  isCommitted?: boolean;
  isOrganizerView?: boolean;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  attendees?: Array<{ user_id?: string; username?: string; display_name?: string; avatar_url?: string | null }>;
}

export const EventCard = memo(({ 
  event, 
  attendeeCount = 0,
  userStatus,
  isCommitted = false,
  isOrganizerView = false,
  onEdit,
  onDelete,
  attendees = []
}: EventCardProps) => {
  const { t, i18n } = useTranslation('events');
  const lang = i18n.language?.startsWith('fr') ? 'fr-FR' : 'en-US';

  const getEventAccent = (): "training" | "match" | "meetup" | "primary" => {
    switch (event.type) {
      case 'training': return 'training';
      case 'match': return 'match';
      case 'meetup': return 'meetup';
      default: return 'primary';
    }
  };

  const isPartOfSeries = !!event.parent_event_id;
  const isRecurringParent = event.is_recurring && !event.parent_event_id;
  const hasOrganizerActions = isOrganizerView && (onEdit || onDelete);
  const isFull = attendeeCount >= (event.max_participants || Infinity);

  const getStatusType = () => {
    if (userStatus === 'attending') return 'going';
    if (userStatus === 'maybe') return 'maybe';
    if (userStatus === 'not_attending') return 'declined';
    return null;
  };

  return (
    <Link to={`/events/${event.id}`}>
      <Card variant="interactive" accent={getEventAccent()}>
        <CardContent className="p-2.5">
          {/* Row 1: Date + Title + Status */}
          <div className="flex items-center gap-2.5">
            <DateBlock date={event.start_time} size="inline" />
            
            <div className="flex-1 min-w-0 flex items-center gap-1.5">
              <h3 className="text-sm font-semibold leading-tight line-clamp-1 flex-1">
                {event.title}
              </h3>
              
              {(isRecurringParent || isPartOfSeries) && (
                <Repeat className="h-3 w-3 text-muted-foreground shrink-0" />
              )}
            </div>

            {/* Status indicator or organizer menu */}
            <div className="shrink-0 flex items-center gap-1">
              {isOrganizerView ? (
                <>
                  {event.pendingRequestsCount && event.pendingRequestsCount > 0 && (
                    <Badge size="sm" className="bg-warning text-warning-foreground border-0 h-5 min-w-5 px-1.5 text-[10px]">
                      {event.pendingRequestsCount}
                    </Badge>
                  )}
                  {hasOrganizerActions && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        {onEdit && (
                          <DropdownMenuItem
                            onClick={(e) => { e.preventDefault(); onEdit(e as unknown as React.MouseEvent); }}
                            className="gap-2"
                          >
                            <Pencil className="h-4 w-4" />
                            {t('edit.title')}
                          </DropdownMenuItem>
                        )}
                        {onEdit && onDelete && <DropdownMenuSeparator />}
                        {onDelete && (
                          <DropdownMenuItem
                            onClick={(e) => { e.preventDefault(); onDelete(e as unknown as React.MouseEvent); }}
                            className="gap-2 text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            {t('details.deleteEvent')}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </>
              ) : isFull ? (
                <StatusPill status="full" size="xs" variant="dot" />
              ) : isCommitted && userStatus === 'attending' ? (
                <span className="text-[10px] text-warning">⭐</span>
              ) : getStatusType() ? (
                <StatusPill status={getStatusType()!} size="xs" variant="dot" />
              ) : event.looking_for_players ? (
                <UserPlus className="h-3.5 w-3.5 text-primary" />
              ) : null}
            </div>
          </div>

          {/* Row 2: Time + Location | Attendees */}
          <div className="flex items-center justify-between gap-2 mt-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
              <Clock className="h-3 w-3 shrink-0" />
              <span>
                {new Date(event.start_time).toLocaleTimeString(lang, { 
                  hour: 'numeric', 
                  minute: '2-digit' 
                })}
              </span>
              {event.location && (
                <>
                  <span className="text-muted-foreground/40">·</span>
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{event.location}</span>
                </>
              )}
            </div>

            {/* Attendees - right aligned */}
            <div className="flex items-center gap-1.5 shrink-0">
              {attendees.length > 0 && (
                <AvatarStack users={attendees} max={3} size="xs" />
              )}
              <span className="text-[10px] text-muted-foreground">
                {attendeeCount} {t('common:going', 'going')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});

EventCard.displayName = "EventCard";
