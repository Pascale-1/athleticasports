import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { PageContainer } from "@/components/mobile/PageContainer";
import { PageHeader } from "@/components/mobile/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon, List, Search, Dumbbell, Users, Swords, Compass, ClipboardList, CalendarCheck, Crown, X as XIcon, ChevronDown } from "lucide-react";
import { useUserEvents, UserEvent } from "@/hooks/useUserEvents";
import { useEventFilters } from "@/hooks/useEventFilters";
import { useDiscoverEvents } from "@/hooks/useDiscoverEvents";
import { useCreatedEvents } from "@/hooks/useCreatedEvents";
import { useEvents } from "@/hooks/useEvents";
import { CreateEventDialog } from "@/components/events/CreateEventDialog";
import { EditEventDialog } from "@/components/events/EditEventDialog";
import { EventsList } from "@/components/events/EventsList";
import { EventCalendar } from "@/components/events/EventCalendar";
import { EventCardSkeleton } from "@/components/events/EventCardSkeleton";
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
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { getActiveSports, getSportEmoji, getSportLabel } from "@/lib/sports";
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
import { useAppWalkthrough } from "@/hooks/useAppWalkthrough";

const EVENT_TYPE_LEGEND = [
  { type: 'training', labelKey: 'types.training', icon: Dumbbell, color: 'text-primary' },
  { type: 'match', labelKey: 'types.game', icon: Swords, color: 'text-primary' },
  { type: 'meetup', labelKey: 'types.meetup', icon: Users, color: 'text-success' },
] as const;

const TAB_CONFIG = [
  { key: 'my', icon: CalendarCheck, labelKey: 'tabs.myEvents' },
  { key: 'organized', icon: Crown, labelKey: 'tabs.organized' },
  { key: 'discover', icon: Compass, labelKey: 'tabs.discover' },
] as const;

const Events = () => {
  const { t, i18n } = useTranslation('events');
  
  const { t: tCommon } = useTranslation('common');
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [activeEventType, setActiveEventType] = useState<'all' | 'training' | 'meetup' | 'match' | 'declined'>('all');
  const [activeSports, setActiveSports] = useState<string[]>([]);
  const [sportPopoverOpen, setSportPopoverOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'my' | 'organized' | 'discover'>('my');
  const [showSearch, setShowSearch] = useState(false);
  
  // Edit/Delete state for Organized tab
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
  
  // Use useUserEvents for "Attending" tab - shows only events user has RSVP'd to
  const { events: attendingEvents, loading: attendingLoading, refetch: refetchAttending } = useUserEvents({ 
    status: 'upcoming',
    includeNotAttending: false // Only show Going/Maybe
  });
  // Fetch declined events separately
  const { events: declinedEvents, loading: declinedLoading, refetch: refetchDeclined } = useUserEvents({ 
    status: 'upcoming',
    includeNotAttending: true
  });
  const { events: discoverEvents, loading: discoverLoading, refetch: refetchDiscover } = useDiscoverEvents();
  const { events: createdEvents, loading: createdEventsLoading, refetch: refetchCreatedEvents } = useCreatedEvents({ status: 'upcoming' });
  
  // Hook for updating/deleting events
  const { updateEvent, deleteEvent } = useEvents();
  
  // Walkthrough
  const { startWalkthrough, hasCompleted } = useAppWalkthrough();
  
  useEffect(() => {
    if (!attendingLoading && !hasCompleted('events')) {
      startWalkthrough('events');
    }
  }, [attendingLoading, startWalkthrough, hasCompleted]);

  // Unified refresh handler
  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refetchAttending(),
      refetchDeclined(),
      refetchDiscover(),
      refetchCreatedEvents(),
    ]);
  }, [refetchAttending, refetchDeclined, refetchDiscover, refetchCreatedEvents]);
  
  // Read tab and type from URL params
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const typeParam = searchParams.get('type');
    if (tabParam === 'discover') {
      setActiveTab('discover');
    } else if (tabParam === 'organized') {
      setActiveTab('organized');
    } else if (tabParam === 'my') {
      setActiveTab('my');
    }
    if (typeParam && ['training', 'meetup', 'match'].includes(typeParam)) {
      setActiveEventType(typeParam as any);
      setTypeFilter(typeParam as any);
    }
  }, [searchParams]);
  
  const {
    filters,
    filteredEvents,
    setTypeFilter,
    setSearchQuery,
    setSportFilter,
  } = useEventFilters(attendingEvents);

  // Filter created events by type and sport
  const filteredCreatedEvents = createdEvents.filter(event => {
    if (activeEventType !== 'all' && activeEventType !== 'declined' && event.type !== activeEventType) return false;
    if (activeSports.length > 0 && !activeSports.some(s => event.sport?.toLowerCase() === s.toLowerCase())) return false;
    return true;
  });

  // Filter discover events by type and sport
  const filteredDiscoverEvents = useMemo(() => {
    return discoverEvents.filter(event => {
      if (activeEventType !== 'all' && activeEventType !== 'declined' && event.type !== activeEventType) return false;
      if (activeSports.length > 0 && !activeSports.some(s => event.sport?.toLowerCase() === s.toLowerCase())) return false;
      return true;
    });
  }, [discoverEvents, activeEventType, activeSports]);

  // Only declined events from the full list
  const onlyDeclinedEvents = declinedEvents.filter(e => e.userStatus === 'not_attending');

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveEventType('all');
    setActiveSports([]);
    setTypeFilter('all');
    setSportFilter('all');
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

  const handleTabChange = (tab: 'my' | 'organized' | 'discover') => {
    setActiveTab(tab);
    if (tab === 'discover') {
      setSearchParams({ tab: 'discover' });
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
      case 'discover':
        return `${discoverEvents.length} ${t('tabs.discoverSubtitle')}`;
      case 'organized':
        return `${createdEvents.length} ${t('tabs.organizedSubtitle')}`;
      default:
        return `${attendingEvents.length} ${t('tabs.myEventsSubtitle', { defaultValue: 'events' })}`;
    }
  };

  const hasActiveFilters = activeEventType !== 'all' || activeSports.length > 0 || filters.searchQuery;

  return (
    <PageContainer>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-2 pb-24 animate-fade-in">
        <PageHeader
          title={t('title')}
          subtitle={getTabSubtitle()}
          rightAction={
            <Button onClick={() => setCreateDialogOpen(true)} size="sm" className="gap-1.5 h-9 hidden md:flex">
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

        {/* Row 1: Underline tabs + view/search icons */}
        <div data-walkthrough="events-tabs" className="flex items-center h-10 border-b border-border">
          <div className="flex-1 flex">
            {TAB_CONFIG.map(({ key, labelKey }) => (
              <button
                key={key}
                className={cn(
                  "flex-1 h-10 text-[12px] font-medium transition-colors relative",
                  activeTab === key ? "text-primary" : "text-muted-foreground"
                )}
                onClick={() => handleTabChange(key as any)}
              >
                {t(labelKey)}
                {activeTab === key && (
                  <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
          <div data-walkthrough="events-view-toggle" className="flex items-center gap-1 shrink-0 pr-1">
            {activeTab === 'my' && (
              <>
                <Button size="icon" variant={viewMode === 'list' ? "default" : "ghost"} className="h-8 w-8" onClick={() => setViewMode('list')}>
                  <List className="h-4 w-4" />
                </Button>
                <Button size="icon" variant={viewMode === 'calendar' ? "default" : "ghost"} className="h-8 w-8" onClick={() => setViewMode('calendar')}>
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button size="icon" variant={showSearch ? "default" : "ghost"} className="h-8 w-8" onClick={() => setShowSearch(!showSearch)}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Row 2: Sport filter chips (shared across all tabs) */}
        <div data-walkthrough="events-filters" className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
          <Button
            size="sm"
            variant="ghost"
            className={cn("h-7 px-2.5 text-[10px] rounded-full shrink-0",
              activeEventType === 'all' ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-card border text-foreground"
            )}
            onClick={() => { setActiveEventType('all'); setTypeFilter('all'); setActiveSports([]); setSportFilter('all'); }}
          >
            {t('types.all')}
          </Button>
          {EVENT_TYPE_LEGEND.map(({ type, labelKey, icon: Icon }) => (
            <Button
              key={type}
              size="sm"
              variant="ghost"
              className={cn("h-7 px-2.5 text-[10px] rounded-full shrink-0 gap-1.5",
                activeEventType === type ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-card border text-foreground"
              )}
              onClick={() => { setActiveEventType(type as any); setTypeFilter(type as any); }}
            >
              <Icon className="h-3.5 w-3.5" />
              {t(labelKey)}
            </Button>
          ))}
          {/* Sport dropdown chip — multi-select */}
          <Popover open={sportPopoverOpen} onOpenChange={setSportPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className={cn("h-7 px-2.5 text-[10px] rounded-full shrink-0 gap-1",
                  activeSports.length > 0 ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-card border text-foreground"
                )}
              >
                {activeSports.length > 0
                  ? activeSports.map(s => getSportEmoji(s)).join(' ') + ` (${activeSports.length})`
                  : `🏅 ${t('filters.sport')}`}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-1" align="start">
              <button
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                  activeSports.length === 0 ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                )}
                onClick={() => { setActiveSports([]); setSportFilter('all'); }}
              >
                {t('filters.allSports')}
              </button>
              {getActiveSports().map(sport => {
                const isSelected = activeSports.includes(sport.id);
                return (
                  <button
                    key={sport.id}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2",
                      isSelected ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                    )}
                    onClick={() => {
                      const newSports = isSelected
                        ? activeSports.filter(s => s !== sport.id)
                        : [...activeSports, sport.id];
                      setActiveSports(newSports);
                      setSportFilter(newSports.length === 1 ? newSports[0] : 'all');
                    }}
                  >
                    {isSelected && <span className="text-primary">✓</span>}
                    {sport.emoji} {sport.label[i18n.language?.startsWith('fr') ? 'fr' : 'en']}
                  </button>
                );
              })}
            </PopoverContent>
          </Popover>
          {/* Declined filter chip */}
          {activeTab === 'my' && (
            <Button
              size="sm"
              variant="ghost"
              className={cn("h-7 px-2.5 text-[10px] rounded-full shrink-0 gap-1.5",
                activeEventType === 'declined' ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : "bg-card border text-foreground"
              )}
              onClick={() => { setActiveEventType('declined'); setTypeFilter('all'); }}
            >
              <XIcon className="h-3.5 w-3.5" />
              {t('tabs.declined')}
              {onlyDeclinedEvents.length > 0 && (
                <span className="ml-0.5 text-[9px]">({onlyDeclinedEvents.length})</span>
              )}
            </Button>
          )}
        </div>

        {/* Collapsible Search */}
        {showSearch && (
          <div className="relative animate-fade-in">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[hsl(var(--text-hint))]" />
            <Input
              placeholder={t('search.placeholder')}
              value={filters.searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
              autoFocus
            />
          </div>
        )}

        <div data-walkthrough="events-list">
        {activeTab === 'discover' ? (
          // Discover Tab
          <div className="space-y-2">
            {discoverLoading ? (
              <div className="space-y-1">
                {[1, 2, 3].map((i) => (
                  <EventCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredDiscoverEvents.length > 0 ? (
              <EventsList events={filteredDiscoverEvents} showInlineRSVP />
            ) : (
              <EmptyState
                icon={Compass}
                title={hasActiveFilters ? t('empty.noFilterResults') : t('discover.empty')}
                description={hasActiveFilters ? t('empty.tryDifferentFilters') : t('discover.emptyDesc')}
                emoji="🔍"
                action={
                  hasActiveFilters ? (
                    <Button variant="outline" onClick={handleResetFilters}>
                      {t('empty.clearFilters')}
                    </Button>
                  ) : (
                    <Button onClick={() => setCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('createEvent')}
                    </Button>
                  )
                }
              />
            )}
          </div>
        ) : activeTab === 'organized' ? (
          // Organized Events Tab
          <div className="space-y-2">
            {createdEventsLoading ? (
              <div className="space-y-1">
                {[1, 2, 3].map((i) => (
                  <EventCardSkeleton key={i} />
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
                title={hasActiveFilters ? t('empty.noFilterResults') : t('organized.empty')}
                description={hasActiveFilters ? t('empty.tryDifferentFilters') : t('organized.emptyDesc')}
                emoji="📋"
                action={
                  hasActiveFilters ? (
                    <Button variant="outline" onClick={handleResetFilters}>
                      {t('empty.clearFilters')}
                    </Button>
                  ) : (
                    <Button onClick={() => setCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('createEvent')}
                    </Button>
                  )
                }
              />
            )}
          </div>
        ) : (
          // My Events Tab
          <>
            {/* Content */}
            {attendingLoading ? (
              <div className="space-y-1">
                {[1, 2, 3].map((i) => (
                  <EventCardSkeleton key={i} />
                ))}
              </div>
            ) : activeEventType === 'declined' ? (
              // Declined events view
              <div className="space-y-2">
                {onlyDeclinedEvents.length > 0 ? (
                  <EventsList events={onlyDeclinedEvents} showInlineRSVP />
                ) : (
                  <EmptyState
                    icon={XIcon}
                    title={t('tabs.declined')}
                    description={t('empty.noResults')}
                  />
                )}
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
                    title={hasActiveFilters ? t('empty.noFilterResults') : t('empty.noUpcoming')}
                    emoji="📅"
                    description={
                      hasActiveFilters
                        ? t('empty.tryDifferentFilters')
                        : filters.searchQuery
                          ? t('empty.tryAdjusting')
                          : t('empty.createFirst')
                    }
                    action={
                      hasActiveFilters ? (
                        <Button variant="outline" onClick={handleResetFilters}>
                          {t('empty.clearFilters')}
                        </Button>
                      ) : !filters.searchQuery ? (
                        <Button onClick={() => setCreateDialogOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          {t('createEvent')}
                        </Button>
                      ) : undefined
                    }
                  />
                )}
              </div>
            )}
          </>
        )}
        </div>
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
      <div data-walkthrough="events-fab">
        <FAB
          icon={<Plus className="h-5 w-5" />}
          label={t('createEvent')}
          onClick={() => setCreateDialogOpen(true)}
        />
      </div>
    </PageContainer>
  );
};

export default Events;
