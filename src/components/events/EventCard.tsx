import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, Trophy, Coffee, UserCheck } from "lucide-react";
import { Event } from "@/lib/events";
import { formatEventDate, formatEventDateRange } from "@/lib/events";
import { Link } from "react-router-dom";

interface EventCardProps {
  event: Event;
  onAttendanceClick?: () => void;
  attendeeCount?: number;
  userStatus?: 'attending' | 'maybe' | 'not_attending' | null;
  showInlineRSVP?: boolean;
  onRSVPChange?: (status: 'attending' | 'maybe' | 'not_attending') => void;
}

export const EventCard = memo(({ 
  event, 
  onAttendanceClick,
  attendeeCount = 0,
  userStatus,
  showInlineRSVP = false,
  onRSVPChange
}: EventCardProps) => {
  const getEventIcon = () => {
    switch (event.type) {
      case 'training':
        return <Trophy className="h-4 w-4" />;
      case 'match':
        return <Trophy className="h-4 w-4" />;
      case 'meetup':
        return <Coffee className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventTypeColor = () => {
    switch (event.type) {
      case 'training':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'match':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'meetup':
        return 'bg-secondary/10 text-secondary-foreground border-secondary/20';
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
        return 'hsl(var(--secondary))';
      default:
        return 'hsl(var(--muted))';
    }
  };

  const getStatusBadge = () => {
    if (!userStatus) return null;
    
    const variants = {
      attending: { label: 'Going', className: 'bg-green-500/10 text-green-700 dark:text-green-400' },
      maybe: { label: 'Maybe', className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' },
      not_attending: { label: 'Not Going', className: 'bg-red-500/10 text-red-700 dark:text-red-400' },
    };

  const { label, className } = variants[userStatus];
    return <Badge className={className}>{label}</Badge>;
  };

  return (
    <Link to={`/events/${event.id}`}>
      <Card 
        className="hover:shadow-md transition-all border-l-4 active:scale-[0.99]" 
        style={{ borderLeftColor: getEventTypeAccentColor() }}
      >
        <CardContent className="p-3 space-y-2.5">
          {/* Row 1: Icon + Title + Status */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className={`p-1.5 rounded-lg ${getEventTypeColor()}`}>
                {getEventIcon()}
              </div>
              <h3 className="font-semibold text-base truncate">
                {event.title}
              </h3>
            </div>
            {getStatusBadge()}
          </div>
          
          {/* Row 2: Date + Time (single line) */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatEventDate(event.start_time)}
            </span>
            {event.end_time && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {new Date(event.start_time).toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </span>
            )}
          </div>
          
          {/* Row 3: Location (if exists) */}
          {event.location && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
          
          {/* Row 4: Attendees + RSVP Pills */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{attendeeCount} going</span>
            </div>

            {/* Always visible RSVP buttons */}
            {showInlineRSVP && onRSVPChange && (
              <div className="flex gap-1">
                <Button
                  variant={userStatus === 'attending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    onRSVPChange('attending');
                  }}
                  className="h-7 w-7 p-0"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={userStatus === 'maybe' ? 'default' : 'outline'}
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    onRSVPChange('maybe');
                  }}
                  className="h-7 w-7 p-0"
                >
                  ?
                </Button>
                <Button
                  variant={userStatus === 'not_attending' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    onRSVPChange('not_attending');
                  }}
                  className="h-7 w-7 p-0"
                >
                  ✕
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});
EventCard.displayName = "EventCard";
