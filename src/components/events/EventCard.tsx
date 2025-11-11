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
  variant?: 'default' | 'compact';
  showInlineRSVP?: boolean;
  onRSVPChange?: (status: 'attending' | 'maybe' | 'not_attending') => void;
}

export const EventCard = ({ 
  event, 
  onAttendanceClick,
  attendeeCount = 0,
  userStatus,
  variant = 'default',
  showInlineRSVP = false,
  onRSVPChange
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

  if (variant === 'compact') {
    return (
      <Link to={`/events/${event.id}`}>
        <Card className={`hover:shadow-md transition-all ${getEventTypeColor()}`}>
          <CardContent className="p-3">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className={`p-1.5 rounded-lg ${getEventTypeColor()} shrink-0`}>
                  {getEventIcon()}
                </div>
                {getStatusBadge()}
              </div>
              
              <h3 className="font-semibold text-body line-clamp-2">{event.title}</h3>
              
              <div className="space-y-1 text-caption text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span className="truncate">{formatEventDate(event.start_time)}</span>
                </div>
                
                {event.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}
              </div>
              
              {showInlineRSVP && onRSVPChange && (
                <div className="flex gap-1 mt-2" onClick={(e) => e.preventDefault()}>
                  <Button
                    onClick={() => onRSVPChange('attending')}
                    variant={userStatus === 'attending' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 text-xs py-1 h-7"
                  >
                    Going
                  </Button>
                  <Button
                    onClick={() => onRSVPChange('maybe')}
                    variant={userStatus === 'maybe' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 text-xs py-1 h-7"
                  >
                    Maybe
                  </Button>
                  <Button
                    onClick={() => onRSVPChange('not_attending')}
                    variant={userStatus === 'not_attending' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 text-xs py-1 h-7"
                  >
                    No
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link to={`/events/${event.id}`}>
      <Card className={`hover:shadow-md transition-all ${getEventTypeColor()}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${getEventTypeColor()}`}>
              {getEventIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-body mb-1 truncate">{event.title}</h3>
                  {event.description && (
                    <p className="text-caption text-muted-foreground line-clamp-2 mb-2">
                      {event.description}
                    </p>
                  )}
                </div>
                {getStatusBadge()}
              </div>
              
              <div className="flex flex-wrap items-center gap-3 text-caption text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatEventDate(event.start_time)}</span>
                </div>
                
                {event.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}
                
                {event.type === 'match' && event.opponent_name && (
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    <span className="truncate">vs {event.opponent_name}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{attendeeCount} attending</span>
                </div>
              </div>
              
              {showInlineRSVP && onRSVPChange && (
                <div className="flex gap-2 mt-3" onClick={(e) => e.preventDefault()}>
                  <Button
                    onClick={() => onRSVPChange('attending')}
                    variant={userStatus === 'attending' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 text-caption"
                  >
                    Going
                  </Button>
                  <Button
                    onClick={() => onRSVPChange('maybe')}
                    variant={userStatus === 'maybe' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 text-caption"
                  >
                    Maybe
                  </Button>
                  <Button
                    onClick={() => onRSVPChange('not_attending')}
                    variant={userStatus === 'not_attending' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 text-caption"
                  >
                    No
                  </Button>
                </div>
              )}
              
              {onAttendanceClick && !showInlineRSVP && (
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    onAttendanceClick();
                  }}
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  RSVP
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
