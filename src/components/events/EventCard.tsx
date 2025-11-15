import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, Trophy, Coffee, UserCheck, UserX, HelpCircle } from "lucide-react";
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
        return <Trophy className="h-6 w-6" />;
      case 'match':
        return <Trophy className="h-6 w-6" />;
      case 'meetup':
        return <Coffee className="h-6 w-6" />;
      default:
        return <Calendar className="h-6 w-6" />;
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
      attending: { 
        label: '✓ Going', 
        className: 'bg-green-600 text-white border-0 font-body font-medium' 
      },
      maybe: { 
        label: '? Maybe', 
        className: 'bg-yellow-600 text-white border-0 font-body font-medium' 
      },
      not_attending: { 
        label: '✕ Not Going', 
        className: 'bg-red-600 text-white border-0 font-body font-medium' 
      },
    };

    const { label, className } = variants[userStatus];
    return <Badge className={className}>{label}</Badge>;
  };

  return (
    <Link to={`/events/${event.id}`}>
      <Card className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border-l-[6px] active:scale-[0.99]" style={{ borderLeftColor: getEventTypeAccentColor() }}>
        <CardContent className="p-3 sm:p-4 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className={`p-1.5 rounded-lg ${getEventTypeColor()}`}>{getEventIcon()}</div>
              <h3 className="text-base font-heading font-semibold truncate">{event.title}</h3>
            </div>
            {getStatusBadge()}
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="font-semibold font-body">{new Date(event.start_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            <span>•</span>
            <Clock className="h-4 w-4" />
            <span className="font-body">{new Date(event.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
          </div>
          {event.location && (<div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground"><MapPin className="h-4 w-4" /><span className="font-body truncate">{event.location}</span></div>)}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs sm:text-sm font-body text-muted-foreground flex items-center gap-1.5"><Users className="h-4 w-4" />{attendeeCount} going</span>
            {showInlineRSVP && onRSVPChange && (
              <div className="flex gap-1.5">
                <Button size="sm" variant={userStatus === 'attending' ? 'default' : 'outline'} className="h-10 px-3 gap-1.5" onClick={(e) => { e.preventDefault(); onRSVPChange('attending'); }}><UserCheck className="h-3.5 w-3.5" /><span className="hidden sm:inline text-xs">Going</span></Button>
                <Button size="sm" variant={userStatus === 'maybe' ? 'default' : 'outline'} className="h-10 px-3 gap-1.5" onClick={(e) => { e.preventDefault(); onRSVPChange('maybe'); }}><HelpCircle className="h-3.5 w-3.5" /><span className="hidden sm:inline text-xs">Maybe</span></Button>
                <Button size="sm" variant={userStatus === 'not_attending' ? 'default' : 'outline'} className="h-10 px-3 gap-1.5" onClick={(e) => { e.preventDefault(); onRSVPChange('not_attending'); }}><UserX className="h-3.5 w-3.5" /><span className="hidden sm:inline text-xs">Pass</span></Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
          {/* Row 1: Icon + Title + Status */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={`p-2 rounded-xl ${getEventTypeColor()}`}>
                {getEventIcon()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-heading font-semibold truncate">
                  {event.title}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <span className="font-semibold font-body">
                    {new Date(event.start_time).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                  <span>•</span>
                  <span className="font-body">
                    {new Date(event.start_time).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </span>
                </div>
              </div>
            </div>
            {getStatusBadge()}
          </div>
          
          {/* Row 2: Location */}
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4.5 w-4.5 flex-shrink-0" />
              <span className="truncate font-body">{event.location}</span>
            </div>
          )}
          
          {/* Row 3: Attendees + Enhanced RSVP */}
          <div className="flex items-center justify-between pt-3 border-t mt-3">
            <div className="flex items-center gap-2 text-sm font-body text-muted-foreground">
              <Users className="h-4.5 w-4.5" />
              <span>{attendeeCount} going</span>
            </div>
            
            {showInlineRSVP && onRSVPChange && (
              <div className="flex gap-2">
                {/* Desktop: Icon + Label */}
                <Button
                  size="sm"
                  variant={userStatus === 'attending' ? 'default' : 'outline'}
                  className="hidden sm:flex h-10 px-4 gap-2 hover:scale-105 active:scale-95 transition-transform"
                  onClick={(e) => {
                    e.preventDefault();
                    onRSVPChange('attending');
                  }}
                >
                  <UserCheck className="h-4 w-4" />
                  <span className="font-body font-medium">Going</span>
                </Button>
                <Button
                  size="sm"
                  variant={userStatus === 'maybe' ? 'default' : 'outline'}
                  className="hidden sm:flex h-10 px-4 gap-2 hover:scale-105 active:scale-95 transition-transform"
                  onClick={(e) => {
                    e.preventDefault();
                    onRSVPChange('maybe');
                  }}
                >
                  <HelpCircle className="h-4 w-4" />
                  <span className="font-body font-medium">Maybe</span>
                </Button>
                <Button
                  size="sm"
                  variant={userStatus === 'not_attending' ? 'default' : 'outline'}
                  className="hidden sm:flex h-10 px-4 gap-2 hover:scale-105 active:scale-95 transition-transform"
                  onClick={(e) => {
                    e.preventDefault();
                    onRSVPChange('not_attending');
                  }}
                >
                  <UserX className="h-4 w-4" />
                  <span className="font-body font-medium">Pass</span>
                </Button>
                
                {/* Mobile: Icon only, larger */}
                <Button
                  size="sm"
                  variant={userStatus === 'attending' ? 'default' : 'outline'}
                  className="sm:hidden h-10 w-10 p-0"
                  onClick={(e) => {
                    e.preventDefault();
                    onRSVPChange('attending');
                  }}
                >
                  <UserCheck className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={userStatus === 'maybe' ? 'default' : 'outline'}
                  className="sm:hidden h-10 w-10 p-0"
                  onClick={(e) => {
                    e.preventDefault();
                    onRSVPChange('maybe');
                  }}
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={userStatus === 'not_attending' ? 'default' : 'outline'}
                  className="sm:hidden h-10 w-10 p-0"
                  onClick={(e) => {
                    e.preventDefault();
                    onRSVPChange('not_attending');
                  }}
                >
                  <UserX className="h-4 w-4" />
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
