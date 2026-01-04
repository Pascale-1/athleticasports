import { useParams, useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/mobile/PageContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EventInviteLink } from "@/components/events/EventInviteLink";
import { EventRSVPBar } from "@/components/events/EventRSVPBar";
import { EventAttendees } from "@/components/events/EventAttendees";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Trophy,
  Trash2,
  ExternalLink,
  Home,
  Shield,
  MoreVertical,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { useEventAttendance } from "@/hooks/useEventAttendance";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { format, isSameDay } from "date-fns";
import { EVENT_CONFIG } from "@/lib/eventConfig";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [teamName, setTeamName] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const { events, loading, deleteEvent } = useEvents();
  const event = events.find(e => e.id === eventId);
  const { stats, attendees, userStatus, isCommitted, updateAttendance, removeAttendance, loading: attendanceLoading } = useEventAttendance(eventId || '');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (event && currentUserId) {
      const isCreator = event.created_by === currentUserId;
      if (isCreator) {
        setCanEdit(true);
      } else if (event.team_id) {
        supabase.rpc('can_manage_team', { 
          _user_id: currentUserId, 
          _team_id: event.team_id 
        }).then(({ data }) => {
          setCanEdit(!!data);
        });
      }
    }
  }, [event, currentUserId]);

  useEffect(() => {
    if (event?.team_id) {
      supabase
        .from('teams')
        .select('name')
        .eq('id', event.team_id)
        .single()
        .then(({ data }) => {
          if (data) setTeamName(data.name);
        });
    }
  }, [event?.team_id]);

  const handleDelete = async () => {
    if (!eventId) return;
    await deleteEvent(eventId);
    navigate('/events');
  };

  const handleAttendanceUpdate = async (status: 'attending' | 'maybe' | 'not_attending') => {
    await updateAttendance(status);
  };

  const handleRemoveAttendance = async () => {
    await removeAttendance();
  };

  if (loading || attendanceLoading) {
    return (
      <PageContainer>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  if (!event) {
    return (
      <PageContainer>
        <div className="text-center space-y-4 py-12">
          <h1 className="text-2xl font-bold">Event not found</h1>
          <Button onClick={() => navigate("/events")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </div>
      </PageContainer>
    );
  }

  const eventConfig = EVENT_CONFIG[event.type];
  const EventIcon = eventConfig.icon;
  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);
  const now = new Date();
  const isPast = endDate < now;
  const isOngoing = startDate <= now && endDate >= now;

  // Format date/time
  const dateStr = format(startDate, "EEEE, MMMM d, yyyy");
  const timeStr = isSameDay(startDate, endDate)
    ? `${format(startDate, "h:mm a")} - ${format(endDate, "h:mm a")}`
    : `${format(startDate, "MMM d, h:mm a")} - ${format(endDate, "MMM d, h:mm a")}`;

  // Check if description needs truncation
  const descriptionLength = event.description?.length || 0;
  const shouldTruncateDescription = descriptionLength > 150;

  return (
    <PageContainer className="pb-36 lg:pb-8">
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Hero Header */}
        <div className="relative -mx-4 -mt-4 px-4 pt-4 pb-6 bg-muted/30">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="h-9 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            
            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Event
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Event type + status */}
          <div className="flex items-center gap-2 mb-3">
            <Badge 
              variant="secondary"
              className={cn("text-sm", eventConfig.color)}
              style={{ backgroundColor: eventConfig.bgColor }}
            >
              <EventIcon className="h-3.5 w-3.5 mr-1" />
              {eventConfig.label}
            </Badge>
            {isPast && <Badge variant="outline" className="bg-background/50">Past</Badge>}
            {isOngoing && <Badge variant="default">Happening Now</Badge>}
            {event.is_public && <Badge variant="outline" className="bg-background/50">Public</Badge>}
          </div>

          {/* Title */}
          <h1 className="text-h1 font-heading font-bold mb-2">{event.title}</h1>

          {/* Date & Time prominent */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{dateStr}</span>
          </div>
          <div className="flex items-center gap-2 text-sm mt-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{timeStr}</span>
          </div>

          {/* Team badge */}
          {teamName && (
            <Badge variant="outline" className="mt-3 bg-background/50">
              {teamName}
            </Badge>
          )}
        </div>

        {/* Details Section */}
        <div className="space-y-4">
          {/* Location */}
          {event.location && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm">{event.location}</p>
                {event.location_url && (
                  <a 
                    href={event.location_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-0.5"
                  >
                    View Map <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Capacity */}
          {event.max_participants && (
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground shrink-0" />
              <p className="text-sm">
                {stats.attending} / {event.max_participants} spots filled
              </p>
            </div>
          )}

          {/* Match-specific: Opponent, Venue, Format */}
          {event.type === 'match' && (
            <>
              {event.opponent_name && (
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground shrink-0" />
                  <p className="text-sm">vs {event.opponent_name}</p>
                </div>
              )}
              {event.home_away && (
                <div className="flex items-center gap-3">
                  <Home className="h-5 w-5 text-muted-foreground shrink-0" />
                  <p className="text-sm capitalize">{event.home_away} game</p>
                </div>
              )}
              {event.match_format && (
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-muted-foreground shrink-0" />
                  <p className="text-sm">{event.match_format}</p>
                </div>
              )}
            </>
          )}

          {/* Meetup category */}
          {event.type === 'meetup' && event.meetup_category && (
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground shrink-0" />
              <p className="text-sm capitalize">{event.meetup_category.replace('_', ' ')}</p>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="pt-2">
              <p className={cn(
                "text-sm text-muted-foreground whitespace-pre-wrap",
                !descriptionExpanded && shouldTruncateDescription && "line-clamp-3"
              )}>
                {event.description}
              </p>
              {shouldTruncateDescription && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-0 text-primary"
                  onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                >
                  {descriptionExpanded ? (
                    <>Show less <ChevronUp className="h-4 w-4 ml-1" /></>
                  ) : (
                    <>Read more <ChevronDown className="h-4 w-4 ml-1" /></>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Share Section (Admin only) */}
        {canEdit && event.invite_code && (
          <div className="border-t pt-4">
            <EventInviteLink
              eventId={event.id}
              inviteCode={event.invite_code}
              allowPublicJoin={event.allow_public_join ?? true}
              eventTitle={event.title}
            />
          </div>
        )}

        {/* Attendees Section */}
        <div className="border-t pt-4">
          <h2 className="text-base font-heading font-semibold mb-3">Who's Coming</h2>
          <EventAttendees attendees={attendees} currentUserId={currentUserId} />
        </div>
      </motion.div>

      {/* Sticky RSVP Bar */}
      <EventRSVPBar
        userStatus={userStatus}
        isCommitted={isCommitted}
        stats={stats}
        onUpdateAttendance={handleAttendanceUpdate}
        onRemoveAttendance={handleRemoveAttendance}
        loading={attendanceLoading}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{event.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
};

export default EventDetail;
