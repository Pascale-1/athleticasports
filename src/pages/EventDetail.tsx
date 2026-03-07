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
import { ManualTeamAssignment } from "@/components/teams/ManualTeamAssignment";
import { GeneratedTeamCard, accentColors } from "@/components/teams/GeneratedTeamCard";
import { GenerateTeamsDialog } from "@/components/teams/GenerateTeamsDialog";
import { useTeamGeneration } from "@/hooks/useTeamGeneration";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { usePerformanceLevels } from "@/hooks/usePerformanceLevels";
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
  Navigation,
  Euro,
  CreditCard
} from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { useEventAttendance } from "@/hooks/useEventAttendance";
import { useEventJoinRequests } from "@/hooks/useEventJoinRequests";
import { useExternalLink } from "@/hooks/useExternalLink";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { format, isSameDay } from "date-fns";
import { EVENT_CONFIG, getEventTypeKey } from "@/lib/eventConfig";
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
import { MAP_PROVIDERS, getDefaultMapUrl, getNativeMapUrl } from "@/lib/mapProviders";
import { Capacitor } from "@capacitor/core";

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
  const [manualMode, setManualMode] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  const { events, loading, deleteEvent, updateEvent } = useEvents();
  const event = events.find(e => e.id === eventId);
  const { stats, attendees, userStatus, isCommitted, hasPaid, updateAttendance, removeAttendance, markAsPaid, refetch: refetchAttendance, loading: attendanceLoading } = useEventAttendance(eventId || '');
  const { 
    pendingRequests, 
    userRequest, 
    sendRequest, 
    approveRequest, 
    rejectRequest, 
    loading: joinRequestsLoading 
  } = useEventJoinRequests(eventId || '');

  // Practice Teams hooks
  const { teams: generatedTeams, loading: teamsLoading, generating, generateTeams, deleteTeams, createGroup, deleteGroup, assignPlayer, removePlayer } = useTeamGeneration(event?.team_id ? eventId || null : null);
  const { members: teamMembers } = useTeamMembers(event?.team_id || null);
  const { getLevelForUser } = usePerformanceLevels(event?.team_id || null);

  // Build player list for manual assignment
  const allPlayers = useMemo(() => {
    if (!teamMembers) return [];
    return teamMembers.map((m: any) => ({
      user_id: m.user_id,
      username: m.profiles?.username || "Unknown",
      display_name: m.profiles?.display_name || null,
      avatar_url: m.profiles?.avatar_url || null,
      performance_level: getLevelForUser(m.user_id),
    }));
  }, [teamMembers, getLevelForUser]);

  const handleGenerate = useCallback(async (numTeams: number) => {
    await generateTeams(numTeams);
  }, [generateTeams]);

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
    // If they have a pending proposal, use proposal flow instead (hide RSVP bar)
    if (userProposal?.status === 'pending') return false;
    
    // Already attending/responded - show RSVP bar for status updates
    if (userStatus) return true;
    
    // Creator can always RSVP
    if (currentUserId === event?.created_by) return true;
    
    // Team members can directly RSVP
    if (isTeamMember) return true;
    
    // Public events or looking_for_players = direct RSVP (no approval needed)
    if (event?.is_public || event?.looking_for_players) return true;
    
    return false;
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
        <div className="text-center space-y-6 py-12">
          <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold">{t('detail.notFound.title')}</h1>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              {t('detail.notFound.description')}
            </p>
          </div>
          <Button onClick={() => navigate("/events")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('detail.notFound.backToEvents')}
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
    <PageContainer className="pb-56 lg:pb-8">
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ touchAction: 'pan-y' }}
      >
        {/* Hero Header with Color Accent */}
        <div className="relative -mx-4 -mt-4">
          <div 
            className="h-1.5 rounded-b-sm" 
            style={{ backgroundColor: eventConfig.bgColor }}
          />
          
          <div className="px-3.5 pt-2 pb-2 bg-gradient-to-b from-muted/40 to-transparent">
            <div className="flex items-center justify-between mb-1.5">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="h-8 -ml-2"
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

            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <Badge 
                variant="secondary"
                className="text-[10px] rounded-full px-2 py-0.5"
                style={{ backgroundColor: eventConfig.bgColor, color: eventConfig.color }}
              >
                <EventIcon className="h-3 w-3 mr-1" />
                {t(`types.${getEventTypeKey(event.type)}`, event.type)}
              </Badge>
              <Badge variant="outline" className="text-[10px] rounded-full px-2 py-0.5">
                {event.is_public ? t('status.public') : t('status.private', 'Privé')}
              </Badge>
              {teamName && (
                <Badge variant="outline" className="text-[10px] rounded-full px-2 py-0.5 bg-background/80">
                  {teamName}
                </Badge>
              )}
              {isPastEvent && <Badge variant="secondary" className="text-[10px] rounded-full px-2 py-0.5">{t('status.past')}</Badge>}
              {isOngoing && <Badge className="text-[10px] rounded-full px-2 py-0.5 bg-success text-success-foreground animate-pulse">{t('status.liveNow')}</Badge>}
            </div>

            <h1 className="text-[16px] font-heading font-bold tracking-tight mb-1">{event.title}</h1>

            <div className="flex items-center gap-2">
              <AddToCalendarButton event={event} variant="ghost" />
            </div>
          </div>
        </div>

        {/* Match Proposal Card - Priority CTA at TOP for matched users */}
        {userProposal?.status === 'pending' && (
          <MatchProposalInlineCard
            proposalId={userProposal.id}
            onAccepted={() => {
              setUserProposal(prev => prev ? { ...prev, status: 'accepted' } : null);
              refetchAttendance();
            }}
            onDeclined={() => {
              setUserProposal(prev => prev ? { ...prev, status: 'declined' } : null);
            }}
          />
        )}

        {/* Looking for Players and RSVP Deadline are now shown inline in When & Where card */}

        {/* When & Where Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-3 space-y-3">
             <h3 className="font-semibold text-[11px] uppercase tracking-[0.8px] text-hint">
              {t('details.whereAndWhen')}
            </h3>
            
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] font-semibold text-primary uppercase leading-none">
                  {format(startDate, "MMM")}
                </span>
                <span className="text-lg font-bold text-primary leading-none">
                  {format(startDate, "d")}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">{format(startDate, "EEEE")}</p>
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
                    className="flex items-center gap-3 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer"
                  >
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-muted/80">
                      <MapPin className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium break-words group-hover:text-primary transition-colors">
                        {event.location}
                      </p>
                      <p className="text-xs text-primary underline">
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
                  {/* Native maps option — opens device maps app */}
                  {Capacitor.isNativePlatform() && (
                    <DropdownMenuItem 
                      onClick={() => {
                        const nativeUrl = getNativeMapUrl(event.location!);
                        window.location.href = nativeUrl;
                      }}
                    >
                      <Map className="h-4 w-4 mr-2" />
                      {t('details.openInMaps', 'Open in Maps')}
                    </DropdownMenuItem>
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

            {/* Cost & Payment */}
            {event.cost && event.cost.trim() !== '' && (
              <div className="flex items-center gap-3 pt-1">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Euro className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {event.cost}€ {event.cost_type === 'per_person' ? t('cost.perPerson') : t('cost.total')}
                  </p>
                </div>
                {event.payment_link && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5 shrink-0"
                    onClick={() => openExternalUrl(event.payment_link!)}
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    {t('cost.openPaymentLink')}
                  </Button>
                )}
              </div>
            )}

            {/* Capacity — always show if max_participants set */}
            {event.max_participants && (
              <div className="flex items-center gap-3 pt-1">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">
                    {stats.attending} / {event.max_participants}
                  </span>
              {event.looking_for_players && (event.max_participants ?? Infinity) > stats.attending && (
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-[rgba(167,139,250,0.10)] text-[#A78BFA]">
                      🔍 {(event.max_participants ?? event.players_needed ?? 0) - stats.attending} {t('details.maxParticipants')}
                    </span>
                  )}
                  {event.max_participants <= stats.attending && (
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-[rgba(248,113,113,0.10)] text-[#F87171]">
                      {t('details.full', 'Full')}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* RSVP Deadline — inline */}
            {event.rsvp_deadline && (
              <div className="flex items-center gap-3 pt-1">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{t('form.rsvpDeadline', 'RSVP Deadline')}</p>
                  <p className="text-sm font-medium">
                    {format(new Date(event.rsvp_deadline), "EEE d MMM, HH:mm")}
                  </p>
                </div>
              </div>
            )}

            {/* Looking for Players — inline */}
            {event.looking_for_players && event.players_needed && (
              <div className="flex items-center gap-3 pt-1">
                <div className="h-10 w-10 rounded-lg bg-[rgba(167,139,250,0.10)] flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-[#A78BFA]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#A78BFA]">
                    🔍 {t('details.lookingForPlayers', 'Looking for players')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {Math.max(0, event.players_needed - stats.attending)} {t('details.spotsLeft', 'spots left')}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Join Requests for Organizers */}
        {canEdit && pendingRequests.length > 0 && (
          <EventJoinRequests
            requests={pendingRequests}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
            isLoading={joinRequestsLoading}
          />
        )}

        {/* Match Details Card */}
        {(hasMatchDetails || (event.type === 'match' && isPastEvent)) && (
          <Card>
            <CardContent className="p-3 space-y-3">
              <h3 className="font-semibold text-[11px] uppercase tracking-[0.8px] text-hint">
                {t('details.matchInfo')}
              </h3>
              
              {event.opponent_name && (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('game.opponent', 'Opponent')}</p>
                    <p className="text-sm font-medium">{event.opponent_name}</p>
                  </div>
                </div>
              )}
              
                <div className="flex flex-wrap gap-2">
                {event.home_away && (
                  <Badge variant="outline" className="bg-muted rounded-full text-xs text-muted-foreground px-3 py-1">
                    {event.home_away === 'home' && <Home className="h-3 w-3 mr-1" />}
                    {event.home_away === 'away' && <Plane className="h-3 w-3 mr-1" />}
                    Terrain : {t(`game.${event.home_away}`)}
                  </Badge>
                )}
                {event.match_format && (
                  <Badge variant="outline">
                    <Trophy className="h-3 w-3 mr-1" />
                    {event.match_format}
                  </Badge>
                )}
              </div>

              {/* Match Result */}
              {event.type === 'match' && (isPastEvent || (event as any).match_result) && (
                <div className="flex items-center gap-3 pt-1">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{t('details.matchResult', 'Result')}</p>
                    {(event as any).match_result ? (
                      <p className="text-lg font-bold text-foreground">{(event as any).match_result}</p>
                    ) : canEdit ? (
                      <input
                        placeholder={t('details.enterResult', 'e.g. 3 - 1')}
                        className="bg-transparent border-b border-border/40 focus:border-primary outline-none text-sm placeholder:text-muted-foreground/50 text-foreground w-full pb-1"
                        onBlur={async (e) => {
                          const val = e.target.value.trim();
                          if (val) {
                            await updateEvent(event.id, { match_result: val } as any);
                          }
                        }}
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter') {
                            const val = (e.target as HTMLInputElement).value.trim();
                            if (val) {
                              await updateEvent(event.id, { match_result: val } as any);
                            }
                          }
                        }}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">{t('details.noResult', 'No result yet')}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Who's Coming Card */}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-[11px] uppercase tracking-[0.8px] text-hint">
                <Users2 className="h-3.5 w-3.5 inline mr-1.5" />
                {t('details.whoComing')}
              </h3>
              {isPaidEvent && (
                <span className="text-[10px] text-muted-foreground">
                  💰 {stats.paid}/{stats.attending} {t('cost.paid', 'paid')}
                </span>
              )}
            </div>
            <EventAttendees attendees={attendees} currentUserId={currentUserId} isPaidEvent={isPaidEvent} />
          </CardContent>
        </Card>

        {/* Mark as Paid - for attending users on paid events */}
        {isPaidEvent && userStatus === 'attending' && !hasPaid && (
          <Card className="border-primary/20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{t('cost.markAsPaid', 'Mark as paid')}</p>
                    <p className="text-xs text-muted-foreground">{t('cost.markAsPaidDesc', 'Confirm you\'ve paid for this event')}</p>
                  </div>
                </div>
                <Button size="sm" className="h-8" onClick={markAsPaid}>
                  {t('cost.iPaid', 'I paid')} ✓
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        {isPaidEvent && userStatus === 'attending' && hasPaid && (
          <div className="flex items-center gap-2 px-1">
            <Badge variant="success" className="text-xs">
              ✓ {t('cost.paid', 'Paid')}
            </Badge>
          </div>
        )}

        {/* Practice Teams Section - Team events only */}
        {event.team_id && isTeamMember && (
          <Card>
            <CardContent className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[11px] uppercase tracking-[0.8px] text-hint">
                  <Users className="h-3.5 w-3.5 inline mr-1.5" />
                  {t('common:practiceTeams.title', 'Practice Teams')}
                </h3>
                {canEdit && (
                  <div className="flex gap-1.5">
                    {generatedTeams.length > 0 && !manualMode && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setManualMode(true)}
                      >
                        {t('common:practiceTeams.manual', 'Manual')}
                      </Button>
                    )}
                    {manualMode && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setManualMode(false)}
                      >
                        {t('common:actions.done', 'Done')}
                      </Button>
                    )}
                    {generatedTeams.length === 0 && !manualMode && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setManualMode(true)}
                        >
                          {t('common:practiceTeams.manual', 'Manual')}
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setShowGenerateDialog(true)}
                          disabled={allPlayers.length < 2}
                        >
                          {t('common:practiceTeams.autoGenerate', 'Auto Generate')}
                        </Button>
                      </>
                    )}
                    {generatedTeams.length > 0 && !manualMode && (
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setShowGenerateDialog(true)}
                      >
                        {t('common:practiceTeams.regenerate', 'Regenerate')}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {teamsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : manualMode && canEdit ? (
                <ManualTeamAssignment
                  allPlayers={allPlayers}
                  teams={generatedTeams}
                  onCreateGroup={createGroup}
                  onDeleteGroup={deleteGroup}
                  onAssignPlayer={async (teamId, player) => {
                    setSaving(true);
                    await assignPlayer(teamId, player);
                    setSaving(false);
                  }}
                  onRemovePlayer={async (memberId) => {
                    setSaving(true);
                    await removePlayer(memberId);
                    setSaving(false);
                  }}
                  saving={saving}
                />
              ) : generatedTeams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {generatedTeams.map((team, idx) => (
                    <GeneratedTeamCard
                      key={team.id}
                      team={team}
                      accentColor={accentColors[idx % accentColors.length]}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t('common:practiceTeams.noTeams', 'No teams created yet')}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Generate Teams Dialog */}
        <GenerateTeamsDialog
          open={showGenerateDialog}
          onOpenChange={setShowGenerateDialog}
          onGenerate={handleGenerate}
          totalPlayers={allPlayers.length}
          generating={generating}
        />

        {/* About / Description Card */}
        {event.description && (
          <Card>
            <CardContent className="p-3">
              <h3 className="font-semibold text-[11px] uppercase tracking-[0.8px] text-hint mb-2">
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
            <CardContent className="p-3">
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

      {/* Match Proposal Card moved to top of page for visibility */}

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
