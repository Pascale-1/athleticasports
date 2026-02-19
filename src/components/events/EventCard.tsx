import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DateBlock } from "@/components/ui/date-block";
import { AvatarStack } from "@/components/ui/avatar-stack";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  MoreVertical,
  Pencil,
  Trash2,
  Repeat,
  Check,
  HelpCircle,
  X,
  UserPlus,
  Clock,
  MapPin,
  Lock,
  Globe,
} from "lucide-react";
import { Event, isPastEvent } from "@/lib/events";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getSportEmoji } from "@/lib/sports";

// Left accent bar colors per event type
const TYPE_ACCENT: Record<string, string> = {
  training: 'border-l-info',
  match: 'border-l-warning',
  meetup: 'border-l-success',
};

interface EventCardProps {
  event: Event & { 
    looking_for_players?: boolean; 
    players_needed?: number | null;
    parent_event_id?: string | null;
    is_recurring?: boolean;
    recurrence_rule?: string | null;
    pendingRequestsCount?: number;
    sport?: string | null;
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
  isOrganizerView = false,
  onEdit,
  onDelete,
  onRSVPChange,
  attendees = []
}: EventCardProps) => {
  const { t, i18n } = useTranslation('events');
  const lang = i18n.language?.startsWith('fr') ? 'fr-FR' : 'en-US';

  const accentClass = TYPE_ACCENT[event.type] || 'border-l-primary';

  const isPartOfSeries = !!event.parent_event_id;
  const isRecurringParent = event.is_recurring && !event.parent_event_id;
  const hasOrganizerActions = isOrganizerView && (onEdit || onDelete);
  
  const maxParticipants = event.max_participants;
  const hasCapacity = maxParticipants && maxParticipants > 0;
  const spotsRemaining = hasCapacity ? Math.max(0, maxParticipants - attendeeCount) : null;
  const isFull = hasCapacity && spotsRemaining === 0;
  const isPast = isPastEvent(event);

  // Format time
  const startTime = new Date(event.start_time);
  const minutes = startTime.getMinutes();
  const timeStr = startTime.toLocaleTimeString(lang, { 
    hour: 'numeric', 
    minute: minutes === 0 ? undefined : '2-digit'
  }).toLowerCase();

  // Venue name only (before the first comma)
  const venueName = event.location 
    ? event.location.split(',')[0].trim()
    : null;

  // Sport emoji
  const sportEmoji = event.sport ? getSportEmoji(event.sport) : null;

  const getStatusLabel = () => {
    switch (userStatus) {
      case 'attending': return t('common:going', 'Going');
      case 'maybe': return t('common:maybe', 'Maybe');
      case 'not_attending': return t('common:declined', "Can't");
      default: return t('common:join', 'Join');
    }
  };

  const getStatusIcon = () => {
    switch (userStatus) {
      case 'attending': return Check;
      case 'maybe': return HelpCircle;
      case 'not_attending': return X;
      default: return null;
    }
  };

  const StatusIcon = getStatusIcon();

  // Players needed display
  const playersNeeded = event.looking_for_players && event.players_needed 
    ? Math.max(0, event.players_needed - attendeeCount)
    : null;
  const showNeedBadge = event.looking_for_players && playersNeeded && playersNeeded > 0;

  return (
    <Link to={`/events/${event.id}`} className="block">
      <Card 
        className={cn(
          "border-l-4 overflow-hidden transition-all active:scale-[0.98]",
          accentClass,
          isPast && "opacity-60"
        )}
      >
        <CardContent className="p-0">
          <div className="flex gap-0">
            {/* Left: DateBlock */}
            <div className="flex flex-col items-center justify-center px-3 py-3 shrink-0">
              <DateBlock date={event.start_time} size="compact" />
            </div>

            {/* Divider */}
            <div className="w-px bg-border shrink-0" />

            {/* Right: Content */}
            <div className="flex-1 min-w-0 px-3 py-2.5 flex flex-col gap-1.5">

              {/* Row 1: Title + organizer actions */}
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                  <h3 className={cn(
                    "text-base font-semibold leading-tight",
                    isPast && "text-muted-foreground"
                  )}>
                    {event.title}
                  </h3>
                  {isPast && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0 bg-muted text-muted-foreground">
                      {t('common:past', 'Past')}
                    </Badge>
                  )}
                  {isFull && !isPast && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0 bg-warning/15 text-warning">
                      {t('common:full', 'Full')}
                    </Badge>
                  )}
                </div>

                {/* Metadata icons (top-right) */}
                <div className="shrink-0 flex items-center gap-1.5">
                  {(isRecurringParent || isPartOfSeries) && (
                    <Repeat className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  {event.is_public 
                    ? <Globe className="h-3.5 w-3.5 text-muted-foreground/70" />
                    : <Lock className="h-3.5 w-3.5 text-muted-foreground/70" />
                  }
                  {isOrganizerView && (
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
                          <DropdownMenuContent align="end" className="w-36 bg-popover">
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
                  )}
                </div>
              </div>

              {/* Row 2: Sport + Time */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {sportEmoji && (
                  <span className="text-sm leading-none">{sportEmoji}</span>
                )}
                <Clock className="h-3 w-3 shrink-0" />
                <span>{timeStr}</span>
                {event.cost && event.cost.trim() !== '' && (
                  <>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="font-medium text-foreground/70">{event.cost}</span>
                  </>
                )}
              </div>

              {/* Row 3: Location */}
              {venueName && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{venueName}</span>
                </div>
              )}

              {/* Row 4: Attendance + RSVP */}
              <div className="flex items-center justify-between gap-2 pt-0.5">
                {/* Avatar stack + count */}
                <div className="flex items-center gap-1.5">
                  {attendees.length > 0 && (
                    <AvatarStack users={attendees} max={3} size="xs" />
                  )}
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                    {hasCapacity 
                      ? `${attendeeCount}/${maxParticipants}` 
                      : attendeeCount > 0 ? `${attendeeCount} ${t('common:going', 'going')}` : ''
                    }
                  </span>
                  {showNeedBadge && (
                    <Badge 
                      variant="secondary" 
                      className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary gap-0.5"
                    >
                      <UserPlus className="h-2.5 w-2.5" />
                      {playersNeeded}
                    </Badge>
                  )}
                </div>

                {/* RSVP Button */}
                {onRSVPChange && (
                  isFull && !userStatus ? (
                    <Badge 
                      variant="secondary"
                      className="h-8 px-3 text-xs rounded-full bg-warning/15 text-warning cursor-not-allowed"
                    >
                      {t('common:full', 'Full')}
                    </Badge>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                        <Button 
                          variant={userStatus ? "secondary" : "default"} 
                          size="sm" 
                          className={cn(
                            "h-8 px-3 text-xs rounded-full gap-1.5 shrink-0",
                            userStatus === 'attending' && "bg-success/15 text-success border-success/30 hover:bg-success/25",
                            userStatus === 'maybe' && "bg-warning/15 text-warning border-warning/30 hover:bg-warning/25",
                            userStatus === 'not_attending' && "bg-muted text-muted-foreground hover:bg-muted/80",
                            !userStatus && "bg-primary text-primary-foreground hover:bg-primary/90"
                          )}
                        >
                          {StatusIcon && <StatusIcon className="h-3.5 w-3.5" />}
                          {getStatusLabel()}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32 bg-popover">
                        <DropdownMenuItem 
                          onClick={(e) => { e.preventDefault(); onRSVPChange('attending'); }}
                          className="gap-2"
                        >
                          <Check className="h-4 w-4 text-success" />
                          {t('common:going', 'Going')}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => { e.preventDefault(); onRSVPChange('maybe'); }}
                          className="gap-2"
                        >
                          <HelpCircle className="h-4 w-4 text-warning" />
                          {t('common:maybe', 'Maybe')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={(e) => { e.preventDefault(); onRSVPChange('not_attending'); }}
                          className="gap-2"
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                          {t('common:declined', "Can't Go")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});

EventCard.displayName = "EventCard";
