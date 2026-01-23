import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, Trophy, Coffee, UserCheck, UserX, HelpCircle, UserPlus, Swords, ChevronDown, Repeat } from "lucide-react";
import { Event } from "@/lib/events";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
}

export const EventCard = memo(({ 
  event, 
  onAttendanceClick,
  attendeeCount = 0,
  userStatus,
  showInlineRSVP = false,
  onRSVPChange,
  isCommitted = false,
  isOrganizerView = false
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
        return <Trophy className="h-4 w-4" />;
      case 'match':
        return <Swords className="h-4 w-4" />;
      case 'meetup':
        return <Coffee className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventTypeColor = () => {
    switch (event.type) {
      case 'training':
        return 'bg-primary/10 text-primary';
      case 'match':
        return 'bg-destructive/10 text-destructive';
      case 'meetup':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getEventTypeAccentColor = () => {
    switch (event.type) {
      case 'training':
        return 'hsl(var(--primary))';
      case 'match':
        return 'hsl(var(--destructive))';
      case 'meetup':
        return 'hsl(var(--muted-foreground))';
      default:
        return 'hsl(var(--muted))';
    }
  };

  const getCurrentRSVP = () => {
    if (!userStatus) return null;
    return RSVP_OPTIONS.find(opt => opt.value === userStatus);
  };

  const currentRSVP = getCurrentRSVP();

  // Helper to get recurrence label
  const getRecurrenceLabel = () => {
    if (!event.recurrence_rule) return null;
    if (event.recurrence_rule.includes('FREQ=DAILY')) return t('recurrence.daily', 'Daily');
    if (event.recurrence_rule.includes('FREQ=WEEKLY')) return t('recurrence.weekly', 'Weekly');
    if (event.recurrence_rule.includes('FREQ=MONTHLY')) return t('recurrence.monthly', 'Monthly');
    return t('recurrence.recurring', 'Recurring');
  };

  const isPartOfSeries = !!event.parent_event_id;
  const isRecurringParent = event.is_recurring && !event.parent_event_id;

  return (
    <Link to={`/events/${event.id}`}>
      <Card 
        className="hover:shadow-md transition-all duration-200 border-l-4 active:scale-[0.995]" 
        style={{ borderLeftColor: getEventTypeAccentColor() }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-3 space-y-2">
          {/* Row 1: Type icon + Title + Recurring badge + RSVP status/action */}
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${getEventTypeColor()}`}>
              {getEventIcon()}
            </div>
            <h3 className="flex-1 text-sm font-heading font-semibold truncate">
              {event.title}
            </h3>
            
            {/* Recurring indicator */}
            {isRecurringParent && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 gap-0.5 border-primary/30 text-primary shrink-0">
                <Repeat className="h-3 w-3" />
                <span className="hidden sm:inline">{getRecurrenceLabel()}</span>
              </Badge>
            )}
            {isPartOfSeries && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 text-muted-foreground shrink-0">
                <Repeat className="h-3 w-3" />
              </Badge>
            )}
            
            {/* Organizer badge or RSVP actions */}
            {isOrganizerView ? (
              <>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-primary/40 text-primary shrink-0">
                  {t('details.organizer')}
                </Badge>
                {event.pendingRequestsCount && event.pendingRequestsCount > 0 && (
                  <Badge className="bg-amber-500 text-white border-0 text-[10px] px-1.5 py-0 h-5 shrink-0">
                    {event.pendingRequestsCount} {t('joinRequests.pending').toLowerCase()}
                  </Badge>
                )}
              </>
            ) : showInlineRSVP && onRSVPChange ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                  <Button
                    size="sm"
                    variant={userStatus ? 'default' : 'outline'}
                    className="h-8 px-2 gap-1 text-xs min-w-[70px]"
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
              <Badge className="bg-amber-600 text-white border-0 text-xs">
                ⭐ {t('rsvp.committed')}
              </Badge>
            ) : userStatus ? (
              <Badge 
                className={`text-xs border-0 text-white ${
                  userStatus === 'attending' ? 'bg-green-600' :
                  userStatus === 'maybe' ? 'bg-yellow-600' :
                  'bg-red-600'
                }`}
              >
                {userStatus === 'attending' ? `✓ ${t('rsvp.going')}` : 
                 userStatus === 'maybe' ? `? ${t('rsvp.maybe')}` : `✕ ${t('rsvp.pass')}`}
              </Badge>
            ) : null}
          </div>

          {/* Row 2: Date, time, location - compact single line */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span className="font-medium">
              {new Date(event.start_time).toLocaleDateString(lang, { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
            <span className="text-muted-foreground/50">•</span>
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>
              {new Date(event.start_time).toLocaleTimeString(lang, { 
                hour: 'numeric', 
                minute: '2-digit' 
              })}
            </span>
            {event.location && (
              <>
                <span className="text-muted-foreground/50">•</span>
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate max-w-[120px]">{event.location}</span>
              </>
            )}
          </div>

          {/* Row 3: Attendee count vs capacity + Looking for players */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {event.max_participants ? (
              <>
                <span className={attendeeCount >= event.max_participants ? 'text-amber-600 font-medium' : ''}>
                  {t('rsvp.countWithMax', { count: attendeeCount, max: event.max_participants })}
                </span>
                {attendeeCount >= event.max_participants && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-amber-100 text-amber-700 border-0">
                    {t('rsvp.full')}
                  </Badge>
                )}
              </>
            ) : (
              <span>{t('rsvp.count', { count: attendeeCount })}</span>
            )}
            
            {event.looking_for_players && (isHovered || event.players_needed) && (
              <Badge 
                variant="outline" 
                className="text-[10px] px-1.5 py-0 h-5 border-primary/40 text-primary animate-in fade-in duration-200"
              >
                <UserPlus className="h-3 w-3 mr-0.5" />
                {event.players_needed ? t('game.needPlayers', { count: event.players_needed }) : t('common:home.open')}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});

EventCard.displayName = "EventCard";
