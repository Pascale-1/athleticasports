import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { PageContainer } from "@/components/mobile/PageContainer";
import { PageHeader } from "@/components/mobile/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon, List, Search, Dumbbell, Users, Swords, UserPlus, ClipboardList } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { useEventFilters } from "@/hooks/useEventFilters";
import { useAvailableGames } from "@/hooks/useAvailableGames";
import { useCreatedEvents } from "@/hooks/useCreatedEvents";
import { CreateEventDialog } from "@/components/events/CreateEventDialog";
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
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const EVENT_TYPE_LEGEND = [
  { type: 'training', labelKey: 'types.training', icon: Dumbbell, color: 'text-blue-500' },
  { type: 'match', labelKey: 'types.game', icon: Swords, color: 'text-amber-500' },
  { type: 'meetup', labelKey: 'types.meetup', icon: Users, color: 'text-emerald-500' },
] as const;

const Events = () => {
  const { t } = useTranslation('events');
  const { t: tMatching } = useTranslation('matching');
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [activeEventType, setActiveEventType] = useState<'all' | 'training' | 'meetup' | 'match'>('all');
  const [activeTab, setActiveTab] = useState<'my' | 'organized' | 'open'>('my');
  
  const { events, loading, createEvent, refetch } = useEvents(undefined, { status: 'upcoming' });
  const { games: openGames, loading: openGamesLoading } = useAvailableGames();
  const { events: createdEvents, loading: createdEventsLoading } = useCreatedEvents({ status: 'upcoming' });
  
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
  } = useEventFilters(events);

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

  return (
    <PageContainer>
      <div className="space-y-4 animate-fade-in">
        {/* Header */}
        <PageHeader
          title={t('title')}
          subtitle={activeTab === 'open' 
            ? `${openGames.length} ${tMatching('openGamesDesc')}`
            : activeTab === 'organized'
            ? `${createdEvents.length} ${t('tabs.organizedSubtitle')}`
            : `${events.length} ${t('title').toLowerCase()}`}
          rightAction={
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('createEvent')}
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

        {/* Tab Switcher: My Events / Organized / Open Games */}
        <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
          <button
            className={cn(
              "flex-1 h-9 px-2 rounded-md text-xs font-medium transition-all text-center leading-tight",
              activeTab === 'my' 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => handleTabChange('my')}
          >
            {t('tabs.myEvents')}
          </button>
          <button
            className={cn(
              "flex-1 h-9 px-2 rounded-md text-xs font-medium transition-all text-center leading-tight",
              activeTab === 'organized' 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => handleTabChange('organized')}
          >
            {t('tabs.organized')}
          </button>
          <button
            className={cn(
              "flex-1 h-9 px-2 rounded-md text-xs font-medium transition-all text-center leading-tight",
              activeTab === 'open' 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => handleTabChange('open')}
          >
            {tMatching('openGames')}
          </button>
        </div>

        {activeTab === 'open' ? (
          // Open Games Tab
          <div className="space-y-4">
            {openGamesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : openGames.length > 0 ? (
              <div className="space-y-3">
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
          <div className="space-y-4">
            {/* Type Filter for Organized */}
            <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide bg-card/50 backdrop-blur-sm border rounded-xl p-1.5">
              <Button 
                size="sm" 
                variant="ghost"
                className={cn(
                  "h-9 px-3 text-xs rounded-lg transition-all whitespace-nowrap",
                  activeEventType === 'all' && "bg-primary/10 text-primary font-medium"
                )}
                onClick={() => setActiveEventType('all')}
              >
                {t('types.all')}
              </Button>
              
              {EVENT_TYPE_LEGEND.map(({ type, labelKey, icon: Icon, color }) => (
                <Button 
                  key={type}
                  size="sm" 
                  variant="ghost"
                  className={cn(
                    "h-9 px-2 md:px-3 text-xs rounded-lg transition-all gap-1.5 whitespace-nowrap",
                    activeEventType === type && "bg-primary/10 text-primary font-medium"
                  )}
                  onClick={() => setActiveEventType(type as any)}
                >
                  <Icon className={cn("h-4 w-4 flex-shrink-0", color)} />
                  <span className="hidden sm:inline">{t(labelKey)}</span>
                </Button>
              ))}
            </div>

            {createdEventsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : filteredCreatedEvents.length > 0 ? (
              <EventsList 
                events={filteredCreatedEvents} 
                showInlineRSVP={false}
                isOrganizerView
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
            {/* Controls Row - Unified Modern Design */}
            <TooltipProvider delayDuration={0}>
              <div className="space-y-3">
                {/* Unified Filter Bar */}
                <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm border rounded-xl p-1.5">
                  {/* Type Filters - Segmented Control */}
                  <div className="flex-1 flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className={cn(
                        "h-9 px-3 text-xs rounded-lg transition-all whitespace-nowrap",
                        activeEventType === 'all' && "bg-primary/10 text-primary font-medium"
                      )}
                      onClick={() => { setActiveEventType('all'); setTypeFilter('all'); }}
                    >
                      {t('types.all')}
                    </Button>
                    
                    {EVENT_TYPE_LEGEND.map(({ type, labelKey, icon: Icon, color }) => (
                      <Tooltip key={type}>
                        <TooltipTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className={cn(
                              "h-9 px-2 md:px-3 text-xs rounded-lg transition-all gap-1.5 whitespace-nowrap overflow-hidden",
                              activeEventType === type && "bg-primary/10 text-primary font-medium"
                            )}
                            onClick={() => { setActiveEventType(type as any); setTypeFilter(type as any); }}
                          >
                            <Icon className={cn("h-4 w-4 flex-shrink-0", color)} />
                            <span className="hidden sm:inline truncate">{t(labelKey)}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          {t(labelKey)}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="h-6 w-px bg-border flex-shrink-0" />

                  {/* View Toggle */}
                  <div className="flex gap-0.5 flex-shrink-0">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className={cn(
                            "h-9 w-9 p-0 rounded-lg",
                            viewMode === 'list' && "bg-primary/10 text-primary"
                          )}
                          onClick={() => setViewMode('list')}
                        >
                          <List className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">{t('views.list')}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className={cn(
                            "h-9 w-9 p-0 rounded-lg",
                            viewMode === 'calendar' && "bg-primary/10 text-primary"
                          )}
                          onClick={() => setViewMode('calendar')}
                        >
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">{t('views.calendar')}</TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder={t('search.placeholder')} 
                    value={filters.searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="pl-9 h-10 bg-card/50 backdrop-blur-sm" 
                  />
                </div>
              </div>
            </TooltipProvider>

            {/* Content */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : viewMode === 'calendar' ? (
              <EventCalendar events={filteredEvents} />
            ) : (
              <div className="space-y-4">
                {groupedEvents.today.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-h3 font-heading font-semibold text-primary">{t('timeGroups.today')}</h3>
                      <Badge variant="secondary" className="text-xs">{groupedEvents.today.length}</Badge>
                    </div>
                    <EventsList events={groupedEvents.today} showInlineRSVP />
                  </div>
                )}

                {groupedEvents.tomorrow.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-h3 font-heading font-semibold text-primary">{t('timeGroups.tomorrow')}</h3>
                      <Badge variant="secondary" className="text-xs">{groupedEvents.tomorrow.length}</Badge>
                    </div>
                    <EventsList events={groupedEvents.tomorrow} showInlineRSVP />
                  </div>
                )}

                {groupedEvents.thisWeek.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-h3 font-heading font-semibold text-primary">{t('timeGroups.thisWeek')}</h3>
                      <Badge variant="secondary" className="text-xs">{groupedEvents.thisWeek.length}</Badge>
                    </div>
                    <EventsList events={groupedEvents.thisWeek} showInlineRSVP />
                  </div>
                )}

                {groupedEvents.later.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-h3 font-heading font-semibold text-primary">{t('timeGroups.comingUp')}</h3>
                      <Badge variant="secondary" className="text-xs">{groupedEvents.later.length}</Badge>
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

      <CreateEventDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        createEvent={createEvent}
        onCreated={refetch}
      />

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
