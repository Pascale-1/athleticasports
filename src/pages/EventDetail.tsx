import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/mobile/PageContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EventInviteLink } from "@/components/events/EventInviteLink";
import { EventRSVPBar } from "@/components/events/EventRSVPBar";
import { EventAttendees } from "@/components/events/EventAttendees";
import { EditEventDialog } from "@/components/events/EditEventDialog";
import { AddToCalendarButton } from "@/components/events/AddToCalendarButton";
import { LookingForPlayersBanner } from "@/components/events/LookingForPlayersBanner";
import { RSVPDeadlineDisplay } from "@/components/events/RSVPDeadlineDisplay";
import { EventJoinRequests } from "@/components/events/EventJoinRequests";
import { MatchProposalInlineCard } from "@/components/matching/MatchProposalInlineCard";
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Users, 
  Trophy,
  Trash2,
  Pencil,
  ExternalLink,
  Home,
  Shield,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Plane,
  Users2,
  Map,
  Navigation
} from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { useEventAttendance } from "@/hooks/useEventAttendance";
import { useEventJoinRequests } from "@/hooks/useEventJoinRequests";
import { useExternalLink } from "@/hooks/useExternalLink";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useMemo } from "react";
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
import { MAP_PROVIDERS, getDefaultMapUrl } from "@/lib/mapProviders";

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('events');
  const { toast } = useToast();
  const { openExternalUrl } = useExternalLink();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [teamName, setTeamName] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [userProposal, setUserProposal] = useState<{ id: string; status: string } | null>(null);

  const { events, loading, deleteEvent, updateEvent } = useEvents();
  const event = events.find(e => e.id === eventId);
  const { stats, attendees, userStatus, isCommitted, updateAttendance, removeAttendance, refetch: refetchAttendance, loading: attendanceLoading } = useEventAttendance(eventId || '');
  const { 
    pendingRequests, 
    userRequest, 
    sendRequest, 
    approveRequest, 
    rejectRequest, 
    loading: joinRequestsLoading 
  } = useEventJoinRequests(eventId || '');

  // Fetch user's match proposal for this event
  useEffect(() => {
    const fetchUserProposal = async () => {
      if (!currentUserId || !eventId) return;
      
      const { data } = await supabase
        .from("match_proposals")
        .select("id, status")
        .eq("event_id", eventId)
        .eq("player_user_id", currentUserId)
        .maybeSingle();
      
      setUserProposal(data);
    };
    fetchUserProposal();
  }, [currentUserId, eventId]);

  // Determine if user should see RSVP bar vs proposal card
  const canDirectRSVP = useMemo(() => {
    // Already attending/responded - show RSVP bar for status updates
    if (userStatus) return true;
    
    // Creator can always RSVP
    if (currentUserId === event?.created_by) return true;
    
    // Team members can directly RSVP
    if (isTeamMember) return true;
    
    // User with pending proposal should use proposal flow instead
    if (userProposal?.status === 'pending') return false;
    
    // For "looking for players" events, non-members must request to join
    if (event?.looking_for_players && !isTeamMember) {
      // They should use the join request flow, not direct RSVP
      return false;
    }
    
    // Otherwise, for public events, allow direct RSVP
    return event?.is_public ?? false;
  }, [currentUserId, event, isTeamMember, userProposal, userStatus]);

  // Wrap approve/reject handlers to refetch attendance after approval
  const handleApproveRequest = async (requestId: string) => {
    const success = await approveRequest(requestId);
    if (success) {
      // Refetch attendance to show the newly approved user
      refetchAttendance();
    }
    return success;
  };

  const handleRejectRequest = async (requestId: string) => {
    return rejectRequest(requestId);
  };

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

      if (currentUserId) {
        supabase.rpc('is_team_member', {
          _user_id: currentUserId,
          _team_id: event.team_id
        }).then(({ data }) => {
          setIsTeamMember(!!data);
        });
      }
    }
  }, [event?.team_id, currentUserId]);

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
  const isPastEvent = endDate < now;
  const isOngoing = startDate <= now && endDate >= now;

  // Use 24h format and en-dash for time display
  const timeStr = isSameDay(startDate, endDate)
    ? `${format(startDate, "HH:mm")} – ${format(endDate, "HH:mm")}`
    : `${format(startDate, "d MMM, HH:mm")} – ${format(endDate, "d MMM, HH:mm")}`;

  const descriptionLength = event.description?.length || 0;
  const shouldTruncateDescription = descriptionLength > 150;
  const hasMatchDetails = event.type === 'match' && (event.opponent_name || event.match_format || event.home_away);

  return (
    <PageContainer className="pb-36 lg:pb-8">
      <motion.div 
        className="space-y-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Hero Header with Color Accent */}
        <div className="relative -mx-4 -mt-4">
          <div 
            className="h-1.5 rounded-b-sm" 
            style={{ backgroundColor: eventConfig.bgColor }}
          />
          
          <div className="px-4 pt-4 pb-5 bg-gradient-to-b from-muted/40 to-transparent">
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="h-9 -ml-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t('common:actions.back', 'Back')}
              </Button>
              
              {canEdit && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover">
                    <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      {t('edit.title')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('common:actions.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge 
                variant="secondary"
                className="text-sm font-medium"
                style={{ backgroundColor: eventConfig.bgColor, color: eventConfig.color }}
              >
                <EventIcon className="h-3.5 w-3.5 mr-1" />
                {eventConfig.label}
              </Badge>
              {teamName && (
                <Badge variant="outline" className="bg-background/80">
                  {teamName}
                </Badge>
              )}
              {isPastEvent && <Badge variant="secondary">{t('status.past')}</Badge>}
              {isOngoing && <Badge className="bg-success text-success-foreground animate-pulse">{t('status.liveNow')}</Badge>}
              {event.is_public && <Badge variant="outline" className="bg-background/80">{t('status.public')}</Badge>}
            </div>

            <h1 className="text-2xl font-heading font-bold tracking-tight mb-4">{event.title}</h1>

            <div className="flex items-center gap-2">
              <AddToCalendarButton event={event} />
            </div>
          </div>
        </div>

        {/* Looking for Players Banner */}
        {event.looking_for_players && event.players_needed && (
          <LookingForPlayersBanner
            playersNeeded={event.players_needed}
            currentAttending={stats.attending}
            maxParticipants={event.max_participants || undefined}
            allowPublicJoin={event.allow_public_join}
            isTeamMember={isTeamMember}
            isCreator={currentUserId === event.created_by}
            requestStatus={userRequest?.status}
            isLoading={joinRequestsLoading}
            onRequestJoin={() => sendRequest()}
          />
        )}

        {/* Join Requests for Organizers */}
        {canEdit && pendingRequests.length > 0 && (
          <EventJoinRequests
            requests={pendingRequests}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
            isLoading={joinRequestsLoading}
          />
        )}

        {/* RSVP Deadline */}
        {event.rsvp_deadline && (
          <RSVPDeadlineDisplay deadline={event.rsvp_deadline} />
        )}

        {/* When & Where Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
              {t('details.whereAndWhen')}
            </h3>
            
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] font-semibold text-primary uppercase leading-none">
                  {format(startDate, "MMM")}
                </span>
                <span className="text-lg font-bold text-primary leading-none">
                  {format(startDate, "d")}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-medium">{format(startDate, "EEEE")}</p>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{timeStr}</span>
                </div>
              </div>
            </div>

            {/* Location - Multi-provider map menu */}
            {event.location && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div 
                    role="button"
                    tabIndex={0}
                    className="flex items-center gap-3 p-3 -mx-1 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer"
                  >
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-muted/80">
                      <MapPin className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {event.location}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('details.tapToOpenMaps')}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-popover">
                  {/* Custom venue link if provided */}
                  {event.location_url && (
                    <>
                      <DropdownMenuItem onClick={() => openExternalUrl(event.location_url!)}>
                        <Navigation className="h-4 w-4 mr-2" />
                        {t('details.openVenueLink')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {/* Map providers */}
                  {MAP_PROVIDERS.map((provider) => (
                    <DropdownMenuItem 
                      key={provider.id}
                      onClick={() => openExternalUrl(provider.getUrl(event.location!))}
                    >
                      <Map className="h-4 w-4 mr-2" />
                      {provider.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Capacity */}
            {event.max_participants && (
              <div className="flex items-center gap-3 pt-1">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {stats.attending} / {event.max_participants} {t('details.participants')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {event.max_participants - stats.attending} {t('details.maxParticipants')}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Match Details Card */}
        {hasMatchDetails && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                {t('details.matchInfo')}
              </h3>
              
              {event.opponent_name && (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                    <Shield className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('game.opponent', 'Opponent')}</p>
                    <p className="font-medium">{event.opponent_name}</p>
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                {event.home_away && (
                  <Badge variant="outline" className="capitalize">
                    {event.home_away === 'home' && <Home className="h-3 w-3 mr-1" />}
                    {event.home_away === 'away' && <Plane className="h-3 w-3 mr-1" />}
                    {event.home_away}
                  </Badge>
                )}
                {event.match_format && (
                  <Badge variant="outline">
                    <Trophy className="h-3 w-3 mr-1" />
                    {event.match_format}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Who's Coming Card */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-4">
              <Users2 className="h-3.5 w-3.5 inline mr-1.5" />
              {t('details.whoComing')}
            </h3>
            <EventAttendees attendees={attendees} currentUserId={currentUserId} />
          </CardContent>
        </Card>

        {/* About / Description Card */}
        {event.description && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-3">
                {t('details.about')}
              </h3>
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
                  className="h-8 px-0 text-primary mt-1"
                  onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                >
                {descriptionExpanded ? (
                    <>{t('details.showLess')} <ChevronUp className="h-4 w-4 ml-1" /></>
                  ) : (
                    <>{t('details.readMore')} <ChevronDown className="h-4 w-4 ml-1" /></>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Meetup category */}
        {event.type === 'meetup' && event.meetup_category && (
          <div className="flex items-center gap-2 px-1">
            <Badge variant="secondary" className="capitalize">
              {event.meetup_category.replace('_', ' ')}
            </Badge>
          </div>
        )}

        {/* Share Section (Admin only) */}
        {canEdit && event.invite_code && (
          <Card>
            <CardContent className="p-4">
              <EventInviteLink
                eventId={event.id}
                inviteCode={event.invite_code}
                allowPublicJoin={event.allow_public_join ?? true}
                eventTitle={event.title}
              />
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Match Proposal Card - for users matched via the matching system */}
      {userProposal?.status === 'pending' && (
        <MatchProposalInlineCard
          proposalId={userProposal.id}
          onAccepted={() => {
            setUserProposal({ ...userProposal, status: 'accepted' });
            refetchAttendance();
          }}
          onDeclined={() => {
            setUserProposal({ ...userProposal, status: 'declined' });
          }}
        />
      )}

      {/* Sticky RSVP Bar - only show if user can directly RSVP */}
      {canDirectRSVP && (
        <EventRSVPBar
          userStatus={userStatus}
          isCommitted={isCommitted}
          stats={stats}
          onUpdateAttendance={handleAttendanceUpdate}
          onRemoveAttendance={handleRemoveAttendance}
          loading={attendanceLoading}
          rsvpDeadline={event.rsvp_deadline}
        />
      )}

      {/* Edit Event Dialog */}
      {event && (
        <EditEventDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          event={event}
          onUpdate={updateEvent}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common:actions.delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('common:confirm.deleteMessage', { name: event.title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('common:actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
};

export default EventDetail;
