import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, Trophy, Coffee, UserCheck, UserX, HelpCircle, UserPlus } from "lucide-react";
import { Event } from "@/lib/events";
import { Link } from "react-router-dom";

interface EventCardProps {
  event: Event & { looking_for_players?: boolean; players_needed?: number | null };
  onAttendanceClick?: () => void;
  attendeeCount?: number;
  userStatus?: 'attending' | 'maybe' | 'not_attending' | null;
  showInlineRSVP?: boolean;
  onRSVPChange?: (status: 'attending' | 'maybe' | 'not_attending') => void;
  isCommitted?: boolean;
}

export const EventCard = memo(({ 
  event, 
  onAttendanceClick,
  attendeeCount = 0,
  userStatus,
  showInlineRSVP = false,
  onRSVPChange,
  isCommitted = false
}: EventCardProps) => {
  const getEventIcon = () => {
    switch (event.type) {
      case 'training':
        return <Trophy className="h-5 w-5" />;
      case 'match':
        return <Trophy className="h-5 w-5" />;
      case 'meetup':
        return <Coffee className="h-5 w-5" />;
      default:
        return <Calendar className="h-5 w-5" />;
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
    
    if (isCommitted && userStatus === 'attending') {
      return (
        <Badge className="bg-amber-600 text-white border-0 font-body font-medium">
          ⭐ Committed
        </Badge>
      );
    }
    
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
      <Card 
        className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border-l-[6px] active:scale-[0.99]" 
        style={{ borderLeftColor: getEventTypeAccentColor() }}
      >
        <CardContent className="p-3 sm:p-4 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className={`p-1.5 rounded-lg ${getEventTypeColor()}`}>
                {getEventIcon()}
              </div>
              <h3 className="text-base font-heading font-semibold truncate">
                {event.title}
              </h3>
            </div>
            {getStatusBadge()}
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="font-semibold font-body">
              {new Date(event.start_time).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
            <span>•</span>
            <Clock className="h-4 w-4" />
            <span className="font-body">
              {new Date(event.start_time).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit' 
              })}
            </span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="font-body truncate">{event.location}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-body text-muted-foreground flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {attendeeCount} going
              </span>
              {event.looking_for_players && (
                <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                  <UserPlus className="h-3 w-3 mr-1" />
                  Looking for players
                </Badge>
              )}
            </div>

            {showInlineRSVP && onRSVPChange && (
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant={userStatus === 'attending' ? 'default' : 'outline'}
                  className="h-10 px-3 gap-1.5"
                  onClick={(e) => {
                    e.preventDefault();
                    onRSVPChange('attending');
                  }}
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline text-xs font-body font-medium">Going</span>
                </Button>
                <Button
                  size="sm"
                  variant={userStatus === 'maybe' ? 'default' : 'outline'}
                  className="h-10 px-3 gap-1.5"
                  onClick={(e) => {
                    e.preventDefault();
                    onRSVPChange('maybe');
                  }}
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline text-xs font-body font-medium">Maybe</span>
                </Button>
                <Button
                  size="sm"
                  variant={userStatus === 'not_attending' ? 'default' : 'outline'}
                  className="h-10 px-3 gap-1.5"
                  onClick={(e) => {
                    e.preventDefault();
                    onRSVPChange('not_attending');
                  }}
                >
                  <UserX className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline text-xs font-body font-medium">Pass</span>
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
