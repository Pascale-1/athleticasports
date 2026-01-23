import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { PageContainer } from "@/components/mobile/PageContainer";
import { PageHeader } from "@/components/mobile/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon, List, Search, Dumbbell, Users, Swords, UserPlus, ClipboardList, CalendarCheck, Crown } from "lucide-react";
import { useUserEvents, UserEvent } from "@/hooks/useUserEvents";
import { useEventFilters } from "@/hooks/useEventFilters";
import { useAvailableGames } from "@/hooks/useAvailableGames";
import { useCreatedEvents } from "@/hooks/useCreatedEvents";
import { useEvents } from "@/hooks/useEvents";
import { CreateEventDialog } from "@/components/events/CreateEventDialog";
import { EditEventDialog } from "@/components/events/EditEventDialog";
import { EventsList } from "@/components/events/EventsList";
import { EventCalendar } from "@/components/events/EventCalendar";
import { AvailableGameCard } from "@/components/matching/AvailableGameCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { isToday, isTomorrow, isThisWeek, isFuture } from "date-fns";
import type { Event } from "@/lib/events";
import { Badge } from "@/components/ui/badge";
import { FAB } from "@/components/mobile/FAB";
import { EmptyState } from "@/components/EmptyState";
import { OnboardingHint } from "@/components/onboarding/OnboardingHint";
import { PullToRefresh } from "@/components/animations/PullToRefresh";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
import { toast } from "@/hooks/use-toast";

const EVENT_TYPE_LEGEND = [
  { type: 'training', labelKey: 'types.training', icon: Dumbbell, color: 'text-blue-500' },
  { type: 'match', labelKey: 'types.game', icon: Swords, color: 'text-amber-500' },
  { type: 'meetup', labelKey: 'types.meetup', icon: Users, color: 'text-emerald-500' },
] as const;

const TAB_CONFIG = [
  { key: 'my', icon: CalendarCheck, labelKey: 'tabs.myEvents' },
  { key: 'organized', icon: Crown, labelKey: 'tabs.organized' },
  { key: 'open', icon: UserPlus, labelKey: 'matching:openGames' },
] as const;

const Events = () => {
  const { t } = useTranslation('events');
  const { t: tMatching } = useTranslation('matching');
  const { t: tCommon } = useTranslation('common');
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [activeEventType, setActiveEventType] = useState<'all' | 'training' | 'meetup' | 'match'>('all');
  const [activeTab, setActiveTab] = useState<'my' | 'organized' | 'open'>('my');
  const [showSearch, setShowSearch] = useState(false);
  
  // Edit/Delete state for Organized tab
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
  
  // Use useUserEvents for "Attending" tab - shows only events user has RSVP'd to
  const { events: attendingEvents, loading: attendingLoading, refetch: refetchAttending } = useUserEvents({ 
    status: 'upcoming',
    includeNotAttending: false // Only show Going/Maybe
  });
  const { games: openGames, loading: openGamesLoading, refetch: refetchOpenGames } = useAvailableGames();
  const { events: createdEvents, loading: createdEventsLoading, refetch: refetchCreatedEvents } = useCreatedEvents({ status: 'upcoming' });
  
  // Hook for updating/deleting events
  const { updateEvent, deleteEvent } = useEvents();

  // Unified refresh handler
  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refetchAttending(),
      refetchOpenGames(),
      refetchCreatedEvents(),
    ]);
  }, [refetchAttending, refetchOpenGames, refetchCreatedEvents]);
  
  // Read tab from URL params
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'open') {
      setActiveTab('open');
    } else if (tabParam === 'organized') {
      setActiveTab('organized');
    }
  }, [searchParams]);
  
  const {
    filters,
    filteredEvents,
    setTypeFilter,
    setSearchQuery,
  } = useEventFilters(attendingEvents);

  // Filter created events by type
  const filteredCreatedEvents = createdEvents.filter(event => {
    if (activeEventType === 'all') return true;
    return event.type === activeEventType;
  });

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveEventType('all');
    setTypeFilter('all');
  };

  // Handle event edit
  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
  };

  // Handle event update from edit dialog
  const handleUpdateEvent = async (eventId: string, data: any) => {
    const success = await updateEvent(eventId, data);
    if (success) {
      refetchCreatedEvents();
      toast({
        title: t('edit.success'),
        description: t('edit.successDesc'),
      });
    }
    return success;
  };

  // Handle event delete confirmation
  const handleDeleteEvent = (event: Event) => {
    setDeletingEvent(event);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deletingEvent) return;
    
    const success = await deleteEvent(deletingEvent.id);
    if (success) {
      refetchCreatedEvents();
      toast({
        title: t('details.deleteSuccess'),
        description: t('details.eventDeleted'),
      });
    }
    setDeletingEvent(null);
  };

  const handleTabChange = (tab: 'my' | 'organized' | 'open') => {
    setActiveTab(tab);
    if (tab === 'open') {
      setSearchParams({ tab: 'open' });
    } else if (tab === 'organized') {
      setSearchParams({ tab: 'organized' });
    } else {
      setSearchParams({});
    }
  };

  // Group events by time period
  const groupEventsByTime = (events: Event[]) => {
    const today: Event[] = [];
    const tomorrow: Event[] = [];
    const thisWeek: Event[] = [];
    const later: Event[] = [];

    events.forEach(event => {
      const eventDate = new Date(event.start_time);
      if (isToday(eventDate)) {
        today.push(event);
      } else if (isTomorrow(eventDate)) {
        tomorrow.push(event);
      } else if (isThisWeek(eventDate)) {
        thisWeek.push(event);
      } else if (isFuture(eventDate)) {
        later.push(event);
      }
    });

    return { today, tomorrow, thisWeek, later };
  };

  const groupedEvents = groupEventsByTime(filteredEvents);

  // Get current tab subtitle
  const getTabSubtitle = () => {
    switch (activeTab) {
      case 'open':
        return `${openGames.length} ${tMatching('openGamesDesc')}`;
      case 'organized':
        return `${createdEvents.length} ${t('tabs.organizedSubtitle')}`;
      default:
        return `${attendingEvents.length} ${t('tabs.myEventsSubtitle', { defaultValue: 'events' })}`;
    }
  };

  return (
    <PageContainer>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-3 animate-fade-in">
        <PageHeader
          title={t('title')}
          subtitle={getTabSubtitle()}
          rightAction={
            <Button onClick={() => setCreateDialogOpen(true)} size="sm" className="gap-1.5 h-9">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t('createEvent')}</span>
            </Button>
          }
        />

        {/* Events Onboarding Hint */}
        <OnboardingHint
          id="hint-events"
          icon={CalendarIcon}
          titleKey="onboarding.events.title"
          descriptionKey="onboarding.events.description"
          variant="info"
        />

        {/* Modern Tab Bar with Icons - Compact */}
        <div className="flex gap-0.5 p-0.5 bg-muted/50 rounded-lg overflow-x-auto scrollbar-hide">
          {TAB_CONFIG.map(({ key, icon: Icon, labelKey }) => {
            const isActive = activeTab === key;
            const count = key === 'my' ? attendingEvents.length : key === 'organized' ? createdEvents.length : openGames.length;
            
            return (
              <button
                key={key}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1 h-8 px-2 rounded-md text-[11px] font-medium transition-all whitespace-nowrap active:scale-[0.97]",
                  isActive 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => handleTabChange(key as any)}
              >
                <Icon className={cn("h-3 w-3 shrink-0", isActive && "text-primary")} />
                <span className="truncate hidden xs:inline max-w-[60px]">{key === 'open' ? tMatching('openGames') : t(labelKey)}</span>
                {count > 0 && (
                  <Badge variant={isActive ? "default" : "secondary"} size="xs">
                    {count}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {activeTab === 'open' ? (
          // Open Games Tab
          <div className="space-y-3">
            {openGamesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-xl" />
                ))}
              </div>
            ) : openGames.length > 0 ? (
              <div className="space-y-2">
                {openGames.map((game) => (
                  <AvailableGameCard key={game.id} game={game} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={UserPlus}
                title={tMatching('noGamesFound')}
                description={tMatching('noGamesDesc')}
                action={
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('createEvent')}
                  </Button>
                }
              />
            )}
          </div>
        ) : activeTab === 'organized' ? (
          // Organized Events Tab
          <div className="space-y-3">
            {/* Compact Type Filter */}
            <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide pb-1">
              <Button 
                size="sm" 
                variant={activeEventType === 'all' ? "default" : "outline"}
                className="h-7 px-2 text-[11px] shrink-0"
                onClick={() => setActiveEventType('all')}
              >
                {t('types.all')}
              </Button>
              
              {EVENT_TYPE_LEGEND.map(({ type, labelKey, icon: Icon, color }) => (
                <Button 
                  key={type}
                  size="sm" 
                  variant={activeEventType === type ? "default" : "outline"}
                  className="h-7 px-2 text-[11px] gap-0.5 shrink-0"
                  onClick={() => setActiveEventType(type as any)}
                >
                  <Icon className={cn("h-3 w-3", activeEventType !== type && color)} />
                  <span className="hidden xs:inline">{t(labelKey)}</span>
                </Button>
              ))}
            </div>

            {createdEventsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-xl" />
                ))}
              </div>
            ) : filteredCreatedEvents.length > 0 ? (
              <EventsList 
                events={filteredCreatedEvents} 
                showInlineRSVP={false}
                isOrganizerView
                onEditEvent={handleEditEvent}
                onDeleteEvent={handleDeleteEvent}
              />
            ) : (
              <EmptyState
                icon={ClipboardList}
                title={t('organized.empty')}
                description={t('organized.emptyDesc')}
                action={
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('createEvent')}
                  </Button>
                }
              />
            )}
          </div>
        ) : (
          // My Events Tab
          <>
            {/* Unified Controls Row */}
            <div className="space-y-2">
            {/* Filter Bar */}
              <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
                {/* Type Filters */}
                <Button 
                  size="sm" 
                  variant={activeEventType === 'all' ? "default" : "outline"}
                  className="h-7 px-2 text-[11px] shrink-0"
                  onClick={() => { setActiveEventType('all'); setTypeFilter('all'); }}
                >
                  {t('types.all')}
                </Button>
                
                {EVENT_TYPE_LEGEND.map(({ type, labelKey, icon: Icon, color }) => (
                  <Button 
                    key={type}
                    size="sm" 
                    variant={activeEventType === type ? "default" : "outline"}
                    className="h-7 px-2 text-[11px] gap-0.5 shrink-0"
                    onClick={() => { setActiveEventType(type as any); setTypeFilter(type as any); }}
                  >
                    <Icon className={cn("h-3 w-3", activeEventType !== type && color)} />
                    <span className="hidden xs:inline">{t(labelKey)}</span>
                  </Button>
                ))}

                <div className="flex-1" />

                {/* View Toggle */}
                <div className="flex gap-0.5 shrink-0">
                  <Button 
                    size="sm" 
                    variant={viewMode === 'list' ? "default" : "ghost"}
                    className="h-7 w-7 p-0"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant={viewMode === 'calendar' ? "default" : "ghost"}
                    className="h-7 w-7 p-0"
                    onClick={() => setViewMode('calendar')}
                  >
                    <CalendarIcon className="h-3.5 w-3.5" />
                  </Button>
                </div>
                
                {/* Search Toggle */}
                <Button
                  size="sm"
                  variant={showSearch ? "default" : "ghost"}
                  className="h-7 w-7 p-0 shrink-0"
                  onClick={() => setShowSearch(!showSearch)}
                >
                  <Search className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Collapsible Search */}
              {showSearch && (
                <div className="relative animate-fade-in">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder={t('search.placeholder')} 
                    value={filters.searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="pl-9 h-9" 
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Content */}
            {attendingLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-xl" />
                ))}
              </div>
            ) : viewMode === 'calendar' ? (
              <EventCalendar events={filteredEvents} />
            ) : (
              <div className="space-y-4">
                {groupedEvents.today.length > 0 && (
                  <div className="space-y-2">
                    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-2 -mx-1 px-1">
                      <div className="flex items-center gap-2">
                        <span className="text-section font-semibold text-primary">{t('timeGroups.today')}</span>
                        <Badge className="bg-primary/10 text-primary border-0 text-[10px]">{groupedEvents.today.length}</Badge>
                      </div>
                    </div>
                    <EventsList events={groupedEvents.today} showInlineRSVP />
                  </div>
                )}

                {groupedEvents.tomorrow.length > 0 && (
                  <div className="space-y-2">
                    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-2 -mx-1 px-1">
                      <div className="flex items-center gap-2">
                        <span className="text-section font-semibold text-primary">{t('timeGroups.tomorrow')}</span>
                        <Badge variant="secondary" className="text-[10px]">{groupedEvents.tomorrow.length}</Badge>
                      </div>
                    </div>
                    <EventsList events={groupedEvents.tomorrow} showInlineRSVP />
                  </div>
                )}

                {groupedEvents.thisWeek.length > 0 && (
                  <div className="space-y-2">
                    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-2 -mx-1 px-1">
                      <div className="flex items-center gap-2">
                        <span className="text-section font-semibold">{t('timeGroups.thisWeek')}</span>
                        <Badge variant="secondary" className="text-[10px]">{groupedEvents.thisWeek.length}</Badge>
                      </div>
                    </div>
                    <EventsList events={groupedEvents.thisWeek} showInlineRSVP />
                  </div>
                )}

                {groupedEvents.later.length > 0 && (
                  <div className="space-y-2">
                    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-2 -mx-1 px-1">
                      <div className="flex items-center gap-2">
                        <span className="text-section font-semibold">{t('timeGroups.comingUp')}</span>
                        <Badge variant="secondary" className="text-[10px]">{groupedEvents.later.length}</Badge>
                      </div>
                    </div>
                    <EventsList events={groupedEvents.later} showInlineRSVP />
                  </div>
                )}

                {filteredEvents.length === 0 && (
                  <EmptyState
                    icon={CalendarIcon}
                    title={t('empty.noUpcoming')}
                    description={
                      filters.searchQuery
                        ? t('empty.tryAdjusting')
                        : t('empty.createFirst')
                    }
                    action={
                      !filters.searchQuery && (
                        <Button onClick={() => setCreateDialogOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          {t('createEvent')}
                        </Button>
                      )
                    }
                  />
                )}
              </div>
            )}
          </>
        )}
        </div>
      </PullToRefresh>
      <CreateEventDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {/* Edit Event Dialog */}
      {editingEvent && (
        <EditEventDialog
          open={!!editingEvent}
          onOpenChange={(open) => !open && setEditingEvent(null)}
          event={editingEvent}
          onUpdate={handleUpdateEvent}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingEvent} onOpenChange={(open) => !open && setDeletingEvent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('details.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('details.deleteWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('details.deleteEvent')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mobile FAB */}
      <FAB
        icon={<Plus className="h-5 w-5" />}
        label={t('createEvent')}
        onClick={() => setCreateDialogOpen(true)}
      />
    </PageContainer>
  );
};

export default Events;
