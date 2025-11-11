import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, Trophy, Coffee, Trash2 } from "lucide-react";
import { Event } from "@/lib/events";
import { formatEventDateRange } from "@/lib/events";
import { useNavigate } from "react-router-dom";
import { useSwipe } from "@/hooks/useSwipe";
import { motion } from "framer-motion";

interface SwipeableEventCardProps {
  event: Event;
  onAttendanceClick?: () => void;
  onDelete?: (id: string) => void;
  attendeeCount?: number;
  userStatus?: 'attending' | 'maybe' | 'not_attending' | null;
  canDelete?: boolean;
}

export const SwipeableEventCard = ({ 
  event, 
  onAttendanceClick, 
  onDelete,
  attendeeCount, 
  userStatus,
  canDelete = false
}: SwipeableEventCardProps) => {
  const navigate = useNavigate();
  const { swipeOffset, isSwiping, handleTouchStart, handleTouchMove, handleTouchEnd, resetSwipe } = useSwipe({
    onSwipeLeft: () => {},
    threshold: 60
  });

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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(event.id);
      resetSwipe();
    }
  };

  return (
    <div className="relative">
      {canDelete && (
        <motion.div
          className="absolute right-0 top-0 bottom-0 flex items-center justify-end pr-4 bg-destructive rounded-lg"
          initial={{ width: 0 }}
          animate={{ width: swipeOffset < -60 ? '80px' : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive-foreground"
            onClick={handleDelete}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </motion.div>
      )}
      
      <motion.div
        animate={{ x: swipeOffset }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onTouchStart={canDelete ? handleTouchStart : undefined}
        onTouchMove={canDelete ? handleTouchMove : undefined}
        onTouchEnd={canDelete ? handleTouchEnd : undefined}
        style={{ touchAction: isSwiping ? 'none' : 'auto' }}
      >
        <Card 
          className="p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate(`/events/${event.id}`)}
        >
          <div className="flex items-start gap-3">
            <div className={`p-3 rounded-lg ${getEventTypeColor()}`}>
              {getEventIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-semibold text-base line-clamp-1">{event.title}</h3>
                  <Badge variant="outline" className="mt-1">
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </Badge>
                </div>
                {getStatusBadge()}
              </div>

              {event.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {event.description}
                </p>
              )}

              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatEventDateRange(event.start_time, event.end_time)}</span>
                </div>

                {event.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                )}

                {attendeeCount !== undefined && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{attendeeCount} attending</span>
                  </div>
                )}
              </div>

              {event.type === 'match' && event.opponent_name && (
                <div className="mt-3 pt-3 border-t">
                  <div className="text-sm">
                    <span className="text-muted-foreground">vs </span>
                    <span className="font-medium">{event.opponent_name}</span>
                    {event.home_away && (
                      <Badge variant="outline" className="ml-2">
                        {event.home_away === 'home' ? 'Home' : event.home_away === 'away' ? 'Away' : 'Neutral'}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {onAttendanceClick && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAttendanceClick();
                  }}
                >
                  {userStatus === 'attending' ? 'Change RSVP' : 'RSVP'}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};