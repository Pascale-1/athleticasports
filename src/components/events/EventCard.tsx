import { memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { 
  MoreVertical,
  Pencil,
  Trash2,
  Repeat,
  Check,
  X,
  Globe,
  Lock,
  MapPin,
  Users,
} from "lucide-react";
import { Event, isPastEvent } from "@/lib/events";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getSportEmoji } from "@/lib/sports";
import { format } from "date-fns";
import { getLocale } from "@/lib/dateUtils";

const TYPE_ACCENT: Record<string, string> = {
  match: 'border-l-accent',
  training: 'border-l-accent',
  meetup: 'border-l-accent',
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
}: EventCardProps) => {
  const { t, i18n } = useTranslation('events');
  const lang = i18n.language?.startsWith('fr') ? 'fr-FR' : 'en-US';
  const locale = getLocale();

  const accentClass = TYPE_ACCENT[event.type] || 'border-l-primary';
  const isPartOfSeries = !!event.parent_event_id;
  const isRecurringParent = event.is_recurring && !event.parent_event_id;
  const hasOrganizerActions = isOrganizerView && (onEdit || onDelete);
  const isPast = isPastEvent(event);

  const { statusChip, heroText, venueName, sportEmoji, timeStr } = useMemo(() => {
    const startTime = new Date(event.start_time);
    const minutes = startTime.getMinutes();
    const time = startTime.toLocaleTimeString(lang, { 
      hour: 'numeric', 
      minute: minutes === 0 ? undefined : '2-digit'
    }).toLowerCase();

    const fullLocation = event.location || null;
    const venue = fullLocation?.includes(',') 
      ? fullLocation.split(',').pop()?.trim() 
      : fullLocation;

    // Status chip logic
    let chip: { emoji: string; label: string; className: string };
    if (isPast) {
      chip = { emoji: '🏁', label: 'Final', className: 'bg-muted text-muted-foreground' };
    } else {
      const dateStr = format(startTime, "MMM d", { locale });
      chip = { emoji: '📅', label: `${dateStr} · ${time}`, className: 'bg-primary/10 text-primary' };
    }

    // Hero text: large date/time for upcoming, title for past
    const hero = isPast ? event.title : format(startTime, "EEEE d MMM", { locale });

    return {
      statusChip: chip,
      heroText: hero,
      venueName: venue,
      sportEmoji: event.sport ? getSportEmoji(event.sport) : null,
      timeStr: time,
    };
  }, [event.start_time, event.location, event.sport, event.title, lang, locale, isPast]);

  const [rsvpSheetOpen, setRsvpSheetOpen] = useState(false);

  const handleRSVPOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRsvpSheetOpen(true);
  };

  const handleRSVPSelect = (status: 'attending' | 'maybe' | 'not_attending') => {
    onRSVPChange?.(status);
    setRsvpSheetOpen(false);
  };

  const rsvpPill = onRSVPChange ? (
    userStatus ? (
      <button
        onClick={handleRSVPOpen}
        className={cn(
          "rounded-full h-[26px] px-2.5 text-[11px] font-medium inline-flex items-center gap-1 shrink-0 transition-colors",
          userStatus === 'attending' && "bg-success/10 text-success",
          userStatus === 'maybe' && "bg-primary/10 text-primary",
          userStatus === 'not_attending' && "bg-destructive/10 text-destructive",
        )}
      >
        {userStatus === 'attending' && <><Check className="h-3 w-3" />{t('rsvp.going')}</>}
        {userStatus === 'maybe' && <><span>?</span>{t('rsvp.maybe')}</>}
        {userStatus === 'not_attending' && <><X className="h-3 w-3" />{t('rsvp.notGoing')}</>}
      </button>
    ) : (
      <button
        onClick={handleRSVPOpen}
        className="border border-primary text-primary rounded-full h-[26px] px-2.5 text-[11px] font-medium shrink-0"
      >
        RSVP →
      </button>
    )
  ) : null;

  const rsvpOptions: Array<{ status: 'attending' | 'maybe' | 'not_attending'; icon: React.ReactNode; label: string; activeClass: string }> = [
    { status: 'attending', icon: <Check className="h-4 w-4" />, label: t('rsvp.going'), activeClass: 'bg-success/10 text-success' },
    { status: 'maybe', icon: <span className="text-sm">?</span>, label: t('rsvp.maybe'), activeClass: 'bg-primary/10 text-primary' },
    { status: 'not_attending', icon: <X className="h-4 w-4" />, label: t('rsvp.notGoing'), activeClass: 'bg-destructive/10 text-destructive' },
  ];

  return (
    <>
      <Link to={`/events/${event.id}`} className="block">
        <Card 
          className={cn(
            "border-l-[3px] overflow-hidden transition-all active:scale-[0.98]",
            accentClass,
            isPast && "opacity-60"
          )}
        >
          <CardContent className="p-0">
            <div className="py-3 px-3.5 flex flex-col gap-1.5">
              {/* ROW 1: Status chip + organizer menu */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    statusChip.className
                  )}>
                    <span>{statusChip.emoji}</span>
                    {statusChip.label}
                  </span>
                  {(isRecurringParent || isPartOfSeries) && (
                    <Repeat className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    {event.is_public 
                      ? <><Globe className="h-2.5 w-2.5" /></>
                      : <><Lock className="h-2.5 w-2.5" /></>
                    }
                  </span>
                </div>

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

              {/* ROW 2: Hero — large title/date (2× size of metadata) */}
              <div>
                <h3 className={cn(
                  "text-[15px] font-bold leading-tight",
                  isPast ? "text-muted-foreground" : "text-foreground"
                )}>
                  {event.title}
                </h3>
                {!isPast && (
                  <p className="text-[22px] font-bold leading-tight text-primary mt-0.5">
                    {heroText}
                  </p>
                )}
              </div>

              {/* ROW 3: Muted metadata — sport, location, attendees */}
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                {sportEmoji && <span>{sportEmoji}</span>}
                {isPast && <span>{timeStr}</span>}
                {venueName && (
                  <span className="flex items-center gap-0.5 truncate">
                    <MapPin className="h-2.5 w-2.5 shrink-0" />
                    {venueName}
                  </span>
                )}
                {attendeeCount > 0 && (
                  <span className="flex items-center gap-0.5">
                    <Users className="h-2.5 w-2.5" />
                    {attendeeCount} {t('rsvp.going')}
                  </span>
                )}
              </div>

              {/* ROW 4: RSVP pill — right-aligned */}
              {rsvpPill && (
                <div className="flex justify-end mt-0.5">
                  {rsvpPill}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* RSVP Bottom Sheet */}
      {onRSVPChange && (
        <Drawer open={rsvpSheetOpen} onOpenChange={setRsvpSheetOpen}>
          <DrawerContent onClick={(e) => e.stopPropagation()}>
            <DrawerHeader className="text-left">
              <DrawerTitle className="text-[14px] font-semibold">{event.title}</DrawerTitle>
              <DrawerDescription className="text-[12px] text-muted-foreground">
                {timeStr} {venueName && `· ${venueName}`}
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-6 flex flex-col gap-2">
              {rsvpOptions.map((opt) => (
                <button
                  key={opt.status}
                  onClick={() => handleRSVPSelect(opt.status)}
                  className={cn(
                    "h-12 w-full rounded-xl text-[14px] font-medium flex items-center gap-3 px-4 transition-colors",
                    userStatus === opt.status ? opt.activeClass : "bg-muted text-foreground"
                  )}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
});

EventCard.displayName = "EventCard";
