import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateBlock } from "@/components/ui/date-block";
import { AvatarStack } from "@/components/ui/avatar-stack";
import { StatusPill } from "@/components/ui/status-pill";
import { 
  MapPin, 
  Clock, 
  UserCheck, 
  UserX, 
  HelpCircle, 
  UserPlus, 
  ChevronDown, 
  Repeat,
  MoreVertical,
  Pencil,
  Trash2
} from "lucide-react";
import { Event } from "@/lib/events";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
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
  onAttendanceClick,
  attendeeCount = 0,
  userStatus,
  showInlineRSVP = false,
  onRSVPChange,
  isCommitted = false,
  isOrganizerView = false,
  onEdit,
  onDelete,
  attendees = []
}: EventCardProps) => {
  const { t, i18n } = useTranslation('events');
  const [isHovered, setIsHovered] = useState(false);
  const lang = i18n.language?.startsWith('fr') ? 'fr-FR' : 'en-US';

  const RSVP_OPTIONS = [
    { value: 'attending', label: t('rsvp.going'), icon: UserCheck, className: 'text-success' },
    { value: 'maybe', label: t('rsvp.maybe'), icon: HelpCircle, className: 'text-warning' },
    { value: 'not_attending', label: t('rsvp.pass'), icon: UserX, className: 'text-destructive' },
  ] as const;

  const getEventAccent = (): "training" | "match" | "meetup" | "primary" => {
    switch (event.type) {
      case 'training': return 'training';
      case 'match': return 'match';
      case 'meetup': return 'meetup';
      default: return 'primary';
    }
  };

  const getCurrentRSVP = () => {
    if (!userStatus) return null;
    return RSVP_OPTIONS.find(opt => opt.value === userStatus);
  };

  const currentRSVP = getCurrentRSVP();

  const getRecurrenceLabel = () => {
    if (!event.recurrence_rule) return null;
    if (event.recurrence_rule.includes('FREQ=DAILY')) return t('recurrence.daily', 'Daily');
    if (event.recurrence_rule.includes('FREQ=WEEKLY')) return t('recurrence.weekly', 'Weekly');
    if (event.recurrence_rule.includes('FREQ=MONTHLY')) return t('recurrence.monthly', 'Monthly');
    return t('recurrence.recurring', 'Recurring');
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
      <Card 
        variant="interactive"
        accent={getEventAccent()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-3.5">
          <div className="flex gap-3.5">
            {/* Date Block - Visual Anchor */}
            <DateBlock date={event.start_time} size="md" />
            
            {/* Main Content */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Row 1: Title + Actions */}
              <div className="flex items-start gap-1.5">
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-heading font-semibold leading-tight line-clamp-1">
                    {event.title}
                  </h3>
                  
                  {/* Time & Location - Single line */}
                  <div className="flex items-center gap-1.5 text-caption text-muted-foreground mt-1">
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
                </div>
                
                {/* Recurring indicator */}
                {(isRecurringParent || isPartOfSeries) && (
                  <Repeat className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                )}

                {/* Organizer menu */}
                {hasOrganizerActions && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 -mt-0.5">
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
              </div>

              {/* Row 2: Attendees + Status */}
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Avatar Stack or Count */}
                  {attendees.length > 0 ? (
                    <AvatarStack users={attendees} max={3} size="xs" />
                  ) : null}
                  
                  {/* Attendance text - cleaner format */}
                  <span className="text-caption text-muted-foreground">
                    {attendeeCount} {t('common:going', 'going')}
                    {event.max_participants && !isFull && (
                      <span className="text-muted-foreground/60"> · {event.max_participants - attendeeCount} {t('common:spotsLeft', 'left')}</span>
                    )}
                  </span>
                  
                  {/* Full badge - Primary status */}
                  {isFull ? (
                    <StatusPill status="full" size="xs" showIcon={false} />
                  ) : event.looking_for_players ? (
                    <Badge variant="outline" size="sm" className="border-primary/30 text-primary bg-primary/5">
                      <UserPlus className="h-2.5 w-2.5 mr-0.5" />
                      {event.players_needed ? `+${event.players_needed}` : t('common:home.open')}
                    </Badge>
                  ) : null}
                </div>

                {/* RSVP Status or Dropdown */}
                <div className="shrink-0">
                {isOrganizerView ? (
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" size="sm" className="border-primary/40 text-primary">
                        {t('details.organizer')}
                      </Badge>
                      {event.pendingRequestsCount && event.pendingRequestsCount > 0 && (
                        <Badge size="sm" className="bg-warning text-warning-foreground border-0">
                          {event.pendingRequestsCount}
                        </Badge>
                      )}
                    </div>
                  ) : showInlineRSVP && onRSVPChange ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                        <Button
                          size="sm"
                          variant={userStatus ? 'default' : 'outline'}
                          className="h-7 px-2.5 gap-1 text-[11px]"
                        >
                          {currentRSVP ? (
                            <>
                              <currentRSVP.icon className="h-3.5 w-3.5" />
                              <span className="hidden xs:inline">{currentRSVP.label}</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3.5 w-3.5" />
                              <span>{t('rsvp.respond')}</span>
                            </>
                          )}
                          <ChevronDown className="h-3 w-3 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        {RSVP_OPTIONS.map((option) => (
                          <DropdownMenuItem
                            key={option.value}
                            onClick={(e) => {
                              e.preventDefault();
                              onRSVPChange(option.value);
                            }}
                            className={`gap-2 ${userStatus === option.value ? 'bg-accent' : ''}`}
                          >
                            <option.icon className={`h-4 w-4 ${option.className}`} />
                            {option.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : isCommitted && userStatus === 'attending' ? (
                    <Badge size="sm" className="bg-warning text-warning-foreground border-0">
                      ⭐ {t('rsvp.committed')}
                    </Badge>
                  ) : getStatusType() ? (
                    <StatusPill status={getStatusType()!} size="sm" />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});

EventCard.displayName = "EventCard";
