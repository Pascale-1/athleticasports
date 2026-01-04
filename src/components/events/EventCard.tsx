import { memo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, Trophy, Coffee, UserCheck, UserX, HelpCircle, UserPlus, Swords, ChevronDown } from "lucide-react";
import { Event } from "@/lib/events";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EventCardProps {
  event: Event & { looking_for_players?: boolean; players_needed?: number | null };
  onAttendanceClick?: () => void;
  attendeeCount?: number;
  userStatus?: 'attending' | 'maybe' | 'not_attending' | null;
  showInlineRSVP?: boolean;
  onRSVPChange?: (status: 'attending' | 'maybe' | 'not_attending') => void;
  isCommitted?: boolean;
}

const RSVP_OPTIONS = [
  { value: 'attending', label: 'Going', icon: UserCheck, className: 'text-green-600' },
  { value: 'maybe', label: 'Maybe', icon: HelpCircle, className: 'text-yellow-600' },
  { value: 'not_attending', label: 'Pass', icon: UserX, className: 'text-red-600' },
] as const;

export const EventCard = memo(({ 
  event, 
  onAttendanceClick,
  attendeeCount = 0,
  userStatus,
  showInlineRSVP = false,
  onRSVPChange,
  isCommitted = false
}: EventCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

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

  return (
    <Link to={`/events/${event.id}`}>
      <Card 
        className="hover:shadow-md transition-all duration-200 border-l-4 active:scale-[0.995]" 
        style={{ borderLeftColor: getEventTypeAccentColor() }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-3 space-y-2">
          {/* Row 1: Type icon + Title + RSVP status/action */}
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${getEventTypeColor()}`}>
              {getEventIcon()}
            </div>
            <h3 className="flex-1 text-sm font-heading font-semibold truncate">
              {event.title}
            </h3>
            
            {/* RSVP: Show current status or compact dropdown */}
            {showInlineRSVP && onRSVPChange ? (
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
                        <span>RSVP</span>
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
                ⭐ Committed
              </Badge>
            ) : userStatus ? (
              <Badge 
                className={`text-xs border-0 text-white ${
                  userStatus === 'attending' ? 'bg-green-600' :
                  userStatus === 'maybe' ? 'bg-yellow-600' :
                  'bg-red-600'
                }`}
              >
                {userStatus === 'attending' ? '✓ Going' : 
                 userStatus === 'maybe' ? '? Maybe' : '✕ Pass'}
              </Badge>
            ) : null}
          </div>

          {/* Row 2: Date, time, location - compact single line */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span className="font-medium">
              {new Date(event.start_time).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
            <span className="text-muted-foreground/50">•</span>
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>
              {new Date(event.start_time).toLocaleTimeString('en-US', { 
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

          {/* Row 3: Attendee count + Looking for players (shown on hover or always if active) */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{attendeeCount} going</span>
            
            {event.looking_for_players && (isHovered || event.players_needed) && (
              <Badge 
                variant="outline" 
                className="text-[10px] px-1.5 py-0 h-5 border-primary/40 text-primary animate-in fade-in duration-200"
              >
                <UserPlus className="h-3 w-3 mr-0.5" />
                {event.players_needed ? `Need ${event.players_needed}` : 'Open'}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});

EventCard.displayName = "EventCard";