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
  Globe,
  Lock
} from "lucide-react";
import { Event } from "@/lib/events";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// Type badge configuration with semantic colors
const TYPE_BADGE_CONFIG = {
  training: { label: 'Workout', labelFr: 'Séance', colorClass: 'bg-info/15 text-info' },
  match: { label: 'Match', labelFr: 'Match', colorClass: 'bg-warning/15 text-warning' },
  meetup: { label: 'Hangout', labelFr: 'Sortie', colorClass: 'bg-success/15 text-success' },
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
  isOrganizerView = false,
  onEdit,
  onDelete,
  onRSVPChange,
  attendees = []
}: EventCardProps) => {
  const { t, i18n } = useTranslation('events');
  const lang = i18n.language?.startsWith('fr') ? 'fr-FR' : 'en-US';
  const isFr = i18n.language?.startsWith('fr');

  const getEventAccent = (): "training" | "match" | "meetup" | "primary" => {
    switch (event.type) {
      case 'training': return 'training';
      case 'match': return 'match';
      case 'meetup': return 'meetup';
      default: return 'primary';
    }
  };

  const typeConfig = TYPE_BADGE_CONFIG[event.type] || TYPE_BADGE_CONFIG.meetup;
  const typeLabel = isFr ? typeConfig.labelFr : typeConfig.label;

  const isPartOfSeries = !!event.parent_event_id;
  const isRecurringParent = event.is_recurring && !event.parent_event_id;
  const hasOrganizerActions = isOrganizerView && (onEdit || onDelete);
  
  const maxParticipants = event.max_participants;
  const hasCapacity = maxParticipants && maxParticipants > 0;
  const spotsRemaining = hasCapacity ? Math.max(0, maxParticipants - attendeeCount) : null;
  const isFull = hasCapacity && spotsRemaining === 0;

  // Format time compactly (7pm instead of 7:00 PM)
  const startTime = new Date(event.start_time);
  const minutes = startTime.getMinutes();
  const timeStr = startTime.toLocaleTimeString(lang, { 
    hour: 'numeric', 
    minute: minutes === 0 ? undefined : '2-digit'
  }).toLowerCase();

  // Truncate location for compact display
  const displayLocation = event.location 
    ? event.location.length > 18 
      ? event.location.slice(0, 16) + '…' 
      : event.location
    : null;

  const getStatusLabel = () => {
    switch (userStatus) {
      case 'attending': return t('common:going', 'Going');
      case 'maybe': return t('common:maybe', 'Maybe');
      case 'not_attending': return t('common:declined', "Can't");
      default: return 'RSVP';
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

  // Calculate "Need X" display
  const playersNeeded = event.looking_for_players && event.players_needed 
    ? Math.max(0, event.players_needed - attendeeCount)
    : spotsRemaining;
  const showNeedBadge = event.looking_for_players && playersNeeded && playersNeeded > 0;

  return (
    <Link to={`/events/${event.id}`} className="block max-w-sm">
      <Card variant="interactive" accent={getEventAccent()} className="active:scale-[0.98] transition-transform">
        <CardContent className="p-3">
          <div className="flex gap-3">
            {/* Left: DateBlock anchor */}
            <DateBlock date={event.start_time} size="compact" className="shrink-0" />
            
            {/* Right: Content */}
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
              {/* Row 1: Title + Type Badge + Actions */}
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-sm font-semibold leading-tight line-clamp-1">
                      {event.title}
                    </h3>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-[10px] px-1.5 py-0 h-4 font-medium shrink-0",
                        typeConfig.colorClass
                      )}
                    >
                      {typeLabel}
                    </Badge>
                    {event.is_public ? (
                      <Globe className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                    ) : (
                      <Lock className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                    )}
                    {(isRecurringParent || isPartOfSeries) && (
                      <Repeat className="h-3 w-3 text-muted-foreground shrink-0" />
                    )}
                  </div>
                </div>

                {/* Organizer actions */}
                {isOrganizerView && (
                  <div className="shrink-0 flex items-center gap-1">
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
                  </div>
                )}
              </div>

              {/* Row 2: Time + Location */}
              <div className="text-xs text-muted-foreground flex items-center min-w-0 overflow-hidden">
                <span className="shrink-0">{timeStr}</span>
                {displayLocation && (
                  <>
                    <span className="mx-1.5 text-muted-foreground/40 shrink-0">·</span>
                    <span className="truncate min-w-0">{displayLocation}</span>
                  </>
                )}
              </div>

              {/* Row 3: Attendance + Need Badge + RSVP */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  {attendees.length > 0 && (
                    <AvatarStack users={attendees} max={3} size="xs" />
                  )}
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                    {hasCapacity 
                      ? `${attendeeCount}/${maxParticipants}` 
                      : `${attendeeCount} ${t('common:going', 'going')}`
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

                {/* Quick RSVP Button */}
                {onRSVPChange && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                      <Button 
                        variant={userStatus ? "secondary" : "outline"} 
                        size="sm" 
                        className={cn(
                          "h-6 px-2 text-[11px] gap-1",
                          userStatus === 'attending' && "bg-success/10 text-success border-success/30 hover:bg-success/20",
                          userStatus === 'maybe' && "bg-warning/10 text-warning border-warning/30 hover:bg-warning/20",
                          userStatus === 'not_attending' && "bg-muted text-muted-foreground",
                          !userStatus && "text-primary"
                        )}
                      >
                        {StatusIcon && <StatusIcon className="h-3 w-3" />}
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
