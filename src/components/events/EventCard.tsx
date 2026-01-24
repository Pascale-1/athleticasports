import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DateBlock } from "@/components/ui/date-block";
import { AvatarStack } from "@/components/ui/avatar-stack";
import { StatusPill } from "@/components/ui/status-pill";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  MapPin, 
  Clock, 
  UserPlus, 
  Repeat,
  MoreVertical,
  Pencil,
  Trash2,
  Dumbbell,
  Swords,
  Users,
  ChevronDown,
  Check,
  HelpCircle,
  X
} from "lucide-react";
import { Event } from "@/lib/events";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// Type icons with semantic colors
const TYPE_CONFIG = {
  training: { icon: Dumbbell, colorClass: 'text-info' },
  match: { icon: Swords, colorClass: 'text-warning' },
  meetup: { icon: Users, colorClass: 'text-success' },
};

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
  onRSVPChange,
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

  const typeConfig = TYPE_CONFIG[event.type] || TYPE_CONFIG.meetup;
  const TypeIcon = typeConfig.icon;

  const isPartOfSeries = !!event.parent_event_id;
  const isRecurringParent = event.is_recurring && !event.parent_event_id;
  const hasOrganizerActions = isOrganizerView && (onEdit || onDelete);
  const isFull = attendeeCount >= (event.max_participants || Infinity);

  // Format time compactly (7pm instead of 7:00 PM)
  const startTime = new Date(event.start_time);
  const minutes = startTime.getMinutes();
  const timeStr = startTime.toLocaleTimeString(lang, { 
    hour: 'numeric', 
    minute: minutes === 0 ? undefined : '2-digit'
  }).toLowerCase();

  // Truncate location for compact display
  const displayLocation = event.location 
    ? event.location.length > 20 
      ? event.location.slice(0, 18) + '…' 
      : event.location
    : null;

  const getStatusLabel = () => {
    switch (userStatus) {
      case 'attending': return t('common:going', 'Going');
      case 'maybe': return t('common:maybe', 'Maybe');
      case 'not_attending': return t('common:declined', "Can't Go");
      default: return 'RSVP';
    }
  };

  const getStatusIcon = () => {
    switch (userStatus) {
      case 'attending': return Check;
      case 'maybe': return HelpCircle;
      case 'not_attending': return X;
      default: return ChevronDown;
    }
  };

  const StatusIcon = getStatusIcon();

  return (
    <Link to={`/events/${event.id}`} className="block max-w-md">
      <Card variant="interactive" accent={getEventAccent()}>
        <CardContent className="p-2.5">
          {/* Row 1: Type Icon + Title + Status/Organizer Actions */}
          <div className="flex items-center gap-2">
            <DateBlock date={event.start_time} size="inline" />
            
            <div className="flex-1 min-w-0 flex items-center gap-1.5">
              <TypeIcon className={cn("h-3.5 w-3.5 shrink-0", typeConfig.colorClass)} />
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
              ) : event.looking_for_players ? (
                <UserPlus className="h-3.5 w-3.5 text-primary" />
              ) : null}
            </div>
          </div>

          {/* Row 2: Time + Location */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5 ml-[52px]">
            <Clock className="h-3 w-3 shrink-0" />
            <span className="whitespace-nowrap shrink-0">{timeStr}</span>
            {displayLocation && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{displayLocation}</span>
              </>
            )}
          </div>

          {/* Row 3: Attendees + RSVP Button */}
          <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/30 ml-[52px]">
            <div className="flex items-center gap-1.5">
              {attendees.length > 0 && (
                <AvatarStack users={attendees} max={3} size="xs" />
              )}
              <span className="text-[10px] text-muted-foreground">
                {attendeeCount} {t('common:going', 'going')}
              </span>
            </div>

            {/* Quick RSVP Button - only show if not organizer view */}
            {!isOrganizerView && onRSVPChange && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                  <Button 
                    variant={userStatus ? "secondary" : "outline"} 
                    size="sm" 
                    className={cn(
                      "h-7 px-2 text-[11px] gap-1",
                      userStatus === 'attending' && "bg-success/10 text-success border-success/30 hover:bg-success/20",
                      userStatus === 'maybe' && "bg-warning/10 text-warning border-warning/30 hover:bg-warning/20",
                      userStatus === 'not_attending' && "bg-muted text-muted-foreground"
                    )}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {getStatusLabel()}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
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
            )}

            {/* Show status dot for organizer view */}
            {isOrganizerView && userStatus && (
              <StatusPill 
                status={userStatus === 'attending' ? 'going' : userStatus === 'maybe' ? 'maybe' : 'declined'} 
                size="xs" 
              />
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});

EventCard.displayName = "EventCard";
