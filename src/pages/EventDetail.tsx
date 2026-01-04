import { useParams, useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/mobile/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EventInviteLink } from "@/components/events/EventInviteLink";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Trophy,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
  Home,
  Shield
} from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { useEventAttendance } from "@/hooks/useEventAttendance";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatEventDate, formatEventDateRange, getEventStatus } from "@/lib/events";
import { EVENT_CONFIG } from "@/lib/eventConfig";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [teamName, setTeamName] = useState<string | null>(null);

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
      // Check if user can edit (creator or team admin)
      const isCreator = event.created_by === currentUserId;
      if (isCreator) {
        setCanEdit(true);
      } else if (event.team_id) {
        // Check if user is team admin
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
    if (!eventId || !confirm('Are you sure you want to delete this event?')) return;
    
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
  const status = getEventStatus(event);

  return (
    <PageContainer>
      <motion.div 
        className="space-y-6 pb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          {canEdit && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>

        {/* Main Event Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge 
                    variant="secondary"
                    className={eventConfig.color}
                  >
                    <EventIcon className="h-3 w-3 mr-1" />
                    {eventConfig.label}
                  </Badge>
                  <Badge variant={status === 'upcoming' ? 'default' : status === 'ongoing' ? 'secondary' : 'outline'}>
                    {status}
                  </Badge>
                  {event.is_public && <Badge variant="outline">Public</Badge>}
                  {teamName && <Badge variant="outline">{teamName}</Badge>}
                </div>
                
                <CardTitle className="text-2xl">{event.title}</CardTitle>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Description */}
            {event.description && (
              <div>
                <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            <Separator />

            {/* Event Details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Date & Time</p>
                  <p className="text-sm text-muted-foreground">
                    {formatEventDateRange(event.start_time, event.end_time)}
                  </p>
                </div>
              </div>

              {event.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                    {event.location_url && (
                      <a 
                        href={event.location_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        View Map <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {event.max_participants && (
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Capacity</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.attending} / {event.max_participants} participants
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Match-specific details */}
            {event.type === 'match' && (
              <>
                <Separator />
                <div className="grid gap-4 sm:grid-cols-2">
                  {event.opponent_name && (
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Opponent</p>
                        <p className="text-sm text-muted-foreground">{event.opponent_name}</p>
                      </div>
                    </div>
                  )}
                  {event.home_away && (
                    <div className="flex items-start gap-3">
                      <Home className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Venue Type</p>
                        <p className="text-sm text-muted-foreground capitalize">{event.home_away}</p>
                      </div>
                    </div>
                  )}
                  {event.match_format && (
                    <div className="flex items-start gap-3">
                      <Trophy className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Format</p>
                        <p className="text-sm text-muted-foreground">{event.match_format}</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Meetup-specific details */}
            {event.type === 'meetup' && event.meetup_category && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Category</p>
                    <p className="text-sm text-muted-foreground capitalize">{event.meetup_category.replace('_', ' ')}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Share Event Section */}
        {canEdit && event.invite_code && (
          <EventInviteLink
            eventId={event.id}
            inviteCode={event.invite_code}
            allowPublicJoin={event.allow_public_join ?? true}
            eventTitle={event.title}
          />
        )}

        {/* Attendance Section */}
        <Card>
          <CardHeader>
            <CardTitle>RSVP</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Commitment Warning */}
            {isCommitted && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm font-medium text-amber-600 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  You are committed to this match
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Cancellations are not allowed for committed attendance.
                </p>
              </div>
            )}

            {/* Attendance Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-success/10 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <p className="font-semibold text-success">{stats.attending}</p>
                </div>
                <p className="text-xs text-muted-foreground">Attending</p>
              </div>
              <div className="text-center p-3 bg-warning/10 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <HelpCircle className="h-4 w-4 text-warning" />
                  <p className="font-semibold text-warning">{stats.maybe}</p>
                </div>
                <p className="text-xs text-muted-foreground">Maybe</p>
              </div>
              <div className="text-center p-3 bg-destructive/10 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <XCircle className="h-4 w-4 text-destructive" />
                  <p className="font-semibold text-destructive">{stats.not_attending}</p>
                </div>
                <p className="text-xs text-muted-foreground">Can't Go</p>
              </div>
            </div>

            {/* RSVP Buttons - Hide if committed */}
            {!isCommitted && (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant={userStatus === 'attending' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => userStatus === 'attending' ? handleRemoveAttendance() : handleAttendanceUpdate('attending')}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {userStatus === 'attending' ? 'Going' : 'I\'m Going'}
                </Button>
                <Button
                  variant={userStatus === 'maybe' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => userStatus === 'maybe' ? handleRemoveAttendance() : handleAttendanceUpdate('maybe')}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  {userStatus === 'maybe' ? 'Maybe' : 'Maybe'}
                </Button>
                <Button
                  variant={userStatus === 'not_attending' ? 'destructive' : 'outline'}
                  className="flex-1"
                  onClick={() => userStatus === 'not_attending' ? handleRemoveAttendance() : handleAttendanceUpdate('not_attending')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {userStatus === 'not_attending' ? 'Not Going' : 'Can\'t Go'}
                </Button>
              </div>
            )}

            {/* Attendees List */}
            {attendees.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-3">Attendees ({attendees.length})</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {attendees.map((attendee) => (
                      <div 
                        key={attendee.user_id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={attendee.profiles?.avatar_url || ''} />
                            <AvatarFallback>
                              {attendee.profiles?.display_name?.[0] || attendee.profiles?.username?.[0] || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {attendee.profiles?.display_name || attendee.profiles?.username || 'Unknown'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {attendee.responded_at ? new Date(attendee.responded_at).toLocaleDateString() : ''}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant={
                            attendee.status === 'attending' ? 'default' : 
                            attendee.status === 'maybe' ? 'secondary' : 
                            'outline'
                          }
                          className={`text-xs ${attendee.is_committed ? 'bg-amber-600 hover:bg-amber-600' : ''}`}
                        >
                          {attendee.is_committed ? (
                            <>⭐ Committed</>
                          ) : (
                            <>
                              {attendee.status === 'attending' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                              {attendee.status === 'maybe' && <HelpCircle className="h-3 w-3 mr-1" />}
                              {attendee.status === 'not_attending' && <XCircle className="h-3 w-3 mr-1" />}
                              {attendee.status === 'attending' ? 'Going' : 
                               attendee.status === 'maybe' ? 'Maybe' : 
                               'Can\'t Go'}
                            </>
                          )}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </PageContainer>
  );
};

export default EventDetail;
