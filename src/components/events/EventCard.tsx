import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Trophy, 
  Coffee, 
  UserCheck, 
  UserX, 
  HelpCircle, 
  UserPlus, 
  Swords, 
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
  onDelete
}: EventCardProps) => {
  const { t, i18n } = useTranslation('events');
  const [isHovered, setIsHovered] = useState(false);
  const lang = i18n.language?.startsWith('fr') ? 'fr-FR' : 'en-US';

  const RSVP_OPTIONS = [
    { value: 'attending', label: t('rsvp.going'), icon: UserCheck, className: 'text-green-600' },
    { value: 'maybe', label: t('rsvp.maybe'), icon: HelpCircle, className: 'text-yellow-600' },
    { value: 'not_attending', label: t('rsvp.pass'), icon: UserX, className: 'text-red-600' },
  ] as const;

  const getEventIcon = () => {
    switch (event.type) {
      case 'training':
        return <Trophy className="h-3 w-3" />;
      case 'match':
        return <Swords className="h-3 w-3" />;
      case 'meetup':
        return <Coffee className="h-3 w-3" />;
      default:
        return <Calendar className="h-3 w-3" />;
    }
  };

  const getEventTypeColor = () => {
    switch (event.type) {
      case 'training':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'match':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
      case 'meetup':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getEventTypeAccentColor = () => {
    switch (event.type) {
      case 'training':
        return 'hsl(217 91% 60%)';
      case 'match':
        return 'hsl(38 92% 50%)';
      case 'meetup':
        return 'hsl(160 60% 45%)';
      default:
        return 'hsl(var(--muted))';
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

  return (
    <Link to={`/events/${event.id}`}>
      <Card 
        className="hover:shadow-md transition-all duration-200 border-l-4 active:scale-[0.99]" 
        style={{ borderLeftColor: getEventTypeAccentColor() }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-2.5 space-y-1.5">
          {/* Row 1: Type icon + Title + Badges */}
          <div className="flex items-center gap-1.5">
            <div className={cn("p-1 rounded-md", getEventTypeColor())}>
              {getEventIcon()}
            </div>
            <h3 className="flex-1 text-card-title font-heading font-semibold truncate">
              {event.title}
            </h3>
            
            {/* Recurring indicator */}
            {isRecurringParent && (
              <Badge variant="outline" size="sm" className="gap-0.5 border-primary/30 text-primary shrink-0">
                <Repeat className="h-2.5 w-2.5" />
                <span className="hidden sm:inline">{getRecurrenceLabel()}</span>
              </Badge>
            )}
            {isPartOfSeries && (
              <Badge variant="outline" size="sm" className="text-muted-foreground shrink-0">
                <Repeat className="h-2.5 w-2.5" />
              </Badge>
            )}
            
            {/* Organizer badge or RSVP */}
            {isOrganizerView ? (
              <>
                <Badge variant="outline" size="sm" className="border-primary/40 text-primary shrink-0">
                  {t('details.organizer')}
                </Badge>
                {event.pendingRequestsCount && event.pendingRequestsCount > 0 && (
                  <Badge size="sm" className="bg-amber-500 text-white border-0 shrink-0">
                    {event.pendingRequestsCount}
                  </Badge>
                )}
              </>
            ) : showInlineRSVP && onRSVPChange ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                  <Button
                    size="sm"
                    variant={userStatus ? 'default' : 'outline'}
                    className="h-7 px-2 gap-0.5 text-[11px]"
                  >
                    {currentRSVP ? (
                      <>
                        <currentRSVP.icon className="h-3 w-3" />
                        <span className="hidden xs:inline">{currentRSVP.label}</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-3 w-3" />
                        <span>{t('rsvp.respond')}</span>
                      </>
                    )}
                    <ChevronDown className="h-2.5 w-2.5 opacity-50" />
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
              <Badge size="sm" className="bg-amber-500 text-white border-0">
                ⭐ {t('rsvp.committed')}
              </Badge>
            ) : userStatus ? (
              <Badge 
                size="sm"
                className={cn(
                  "border-0 text-white",
                  userStatus === 'attending' && "bg-green-500",
                  userStatus === 'maybe' && "bg-amber-500",
                  userStatus === 'not_attending' && "bg-muted-foreground/60"
                )}
              >
                {userStatus === 'attending' ? `✓ ${t('rsvp.going')}` : 
                 userStatus === 'maybe' ? `? ${t('rsvp.maybe')}` : `✕ ${t('rsvp.pass')}`}
              </Badge>
            ) : null}

            {/* Organizer menu */}
            {hasOrganizerActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
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

          {/* Row 2: Date, time, location */}
          <div className="flex items-center gap-1 text-caption text-muted-foreground flex-wrap">
            <Calendar className="h-2.5 w-2.5 shrink-0" />
            <span className="font-medium">
              {new Date(event.start_time).toLocaleDateString(lang, { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
            <span className="text-muted-foreground/50">•</span>
            <Clock className="h-2.5 w-2.5 shrink-0" />
            <span>
              {new Date(event.start_time).toLocaleTimeString(lang, { 
                hour: 'numeric', 
                minute: '2-digit' 
              })}
            </span>
            {event.location && (
              <>
                <span className="text-muted-foreground/50">•</span>
                <MapPin className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate max-w-[80px]">{event.location}</span>
              </>
            )}
          </div>

          {/* Row 3: Attendees + Looking for players */}
          <div className="flex items-center gap-1.5 text-caption text-muted-foreground">
            <div className="flex items-center gap-0.5">
              <Users className="h-2.5 w-2.5" />
              {event.max_participants ? (
                <span className={attendeeCount >= event.max_participants ? 'text-amber-600 font-medium' : ''}>
                  {attendeeCount}/{event.max_participants}
                </span>
              ) : (
                <span>{attendeeCount}</span>
              )}
            </div>
            
            {attendeeCount >= (event.max_participants || Infinity) && (
              <Badge variant="secondary" size="xs" className="bg-amber-100 text-amber-700 border-0">
                {t('rsvp.full')}
              </Badge>
            )}
            
            {event.looking_for_players && (
              <Badge 
                variant="outline" 
                size="xs"
                className="border-primary/40 text-primary"
              >
                <UserPlus className="h-2 w-2 mr-0.5" />
                {event.players_needed ? `+${event.players_needed}` : t('common:home.open')}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});

EventCard.displayName = "EventCard";
