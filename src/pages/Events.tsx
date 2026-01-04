import { useState } from "react";
import { PageContainer } from "@/components/mobile/PageContainer";
import { PageHeader } from "@/components/mobile/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon, List, Search, Trophy, Coffee, Swords } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { useEventFilters } from "@/hooks/useEventFilters";
import { CreateEventDialog } from "@/components/events/CreateEventDialog";
import { EventsList } from "@/components/events/EventsList";
import { EventCalendar } from "@/components/events/EventCalendar";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterSheet } from "@/components/common/FilterSheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isToday, isTomorrow, isThisWeek, isFuture } from "date-fns";
import type { Event } from "@/lib/events";
import { Badge } from "@/components/ui/badge";
import { FAB } from "@/components/mobile/FAB";
import { EmptyState } from "@/components/EmptyState";

const EVENT_TYPE_LEGEND = [
  { type: 'training', label: 'Training', icon: Trophy, color: 'text-primary' },
  { type: 'match', label: 'Match', icon: Swords, color: 'text-destructive' },
  { type: 'meetup', label: 'Meetup', icon: Coffee, color: 'text-muted-foreground' },
] as const;

const Events = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [activeEventType, setActiveEventType] = useState<'all' | 'training' | 'meetup' | 'match'>('all');
  
  const { events, loading, createEvent, refetch } = useEvents(undefined, { status: 'upcoming' });
  
  const {
    filters,
    filteredEvents,
    setTypeFilter,
    setStatusFilter,
    setSearchQuery,
    setPublicFilter,
  } = useEventFilters(events);

  const activeFilterCount = 
    (filters.status !== 'upcoming' ? 1 : 0) + 
    (filters.isPublic !== undefined ? 1 : 0);

  const handleResetFilters = () => {
    setStatusFilter('upcoming');
    setPublicFilter(undefined);
    setSearchQuery('');
    setActiveEventType('all');
    setTypeFilter('all');
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
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <PageHeader
          title="Events"
          subtitle={`${events.length} event${events.length !== 1 ? 's' : ''} available`}
          rightAction={
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          }
        />

        {/* Controls Row */}
        <div className="space-y-3">
          {/* Type Filter + View Toggle */}
          <div className="flex items-center justify-between gap-3">
            {/* Mobile: Event Type Dropdown */}
            <Select 
              value={activeEventType} 
              onValueChange={(value: any) => {
                setActiveEventType(value);
                setTypeFilter(value);
              }}
            >
              <SelectTrigger className="w-36 h-10 md:hidden">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="meetup">Meetup</SelectItem>
                <SelectItem value="match">Match</SelectItem>
              </SelectContent>
            </Select>

            {/* Desktop: Event Type Pills */}
            <div className="hidden md:flex gap-1 bg-muted p-1 rounded-lg">
              <Button 
                size="sm" 
                variant={activeEventType === 'all' ? 'default' : 'ghost'} 
                className="h-10 px-3 text-xs" 
                onClick={() => { setActiveEventType('all'); setTypeFilter('all'); }}
              >
                All Types
              </Button>
              <Button 
                size="sm" 
                variant={activeEventType === 'training' ? 'default' : 'ghost'} 
                className="h-10 px-3 text-xs gap-1.5" 
                onClick={() => { setActiveEventType('training'); setTypeFilter('training'); }}
              >
                <Trophy className="h-3.5 w-3.5" />
                Training
              </Button>
              <Button 
                size="sm" 
                variant={activeEventType === 'meetup' ? 'default' : 'ghost'} 
                className="h-10 px-3 text-xs gap-1.5" 
                onClick={() => { setActiveEventType('meetup'); setTypeFilter('meetup'); }}
              >
                <Coffee className="h-3.5 w-3.5" />
                Meetup
              </Button>
              <Button 
                size="sm" 
                variant={activeEventType === 'match' ? 'default' : 'ghost'} 
                className="h-10 px-3 text-xs gap-1.5" 
                onClick={() => { setActiveEventType('match'); setTypeFilter('match'); }}
              >
                <Swords className="h-3.5 w-3.5" />
                Match
              </Button>
            </div>

            {/* View Toggle */}
            <div className="flex gap-1 bg-muted p-1 rounded-lg">
              <Button 
                size="sm" 
                variant={viewMode === 'list' ? 'default' : 'ghost'} 
                className="h-10 w-10 p-0" 
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant={viewMode === 'calendar' ? 'default' : 'ghost'} 
                className="h-10 w-10 p-0" 
                onClick={() => setViewMode('calendar')}
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </div>

            {/* Event Type Legend - Mobile only */}
            <div className="flex items-center gap-3 md:hidden">
              {EVENT_TYPE_LEGEND.map(({ type, label, icon: Icon, color }) => (
                <button
                  key={type}
                  onClick={() => { setActiveEventType(type as any); setTypeFilter(type as any); }}
                  className={`flex items-center gap-1.5 text-xs transition-opacity ${
                    activeEventType === 'all' || activeEventType === type 
                      ? 'opacity-100' 
                      : 'opacity-50'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${color}`} />
                  <span className="text-muted-foreground">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search + Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search events..." 
                value={filters.searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-9 h-10" 
              />
            </div>
            <FilterSheet activeCount={activeFilterCount} onApply={() => {}} onReset={handleResetFilters}>
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>Status</Label>
                  <Select value={filters.status} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="past">Past</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </FilterSheet>
          </div>
        </div>

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
          <div className="space-y-6">
            {groupedEvents.today.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-h3 font-heading font-semibold text-primary">Today</h3>
                  <Badge variant="secondary" className="text-xs">{groupedEvents.today.length}</Badge>
                </div>
                <EventsList events={groupedEvents.today} showInlineRSVP />
              </div>
            )}

            {groupedEvents.tomorrow.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-h3 font-heading font-semibold text-primary">Tomorrow</h3>
                  <Badge variant="secondary" className="text-xs">{groupedEvents.tomorrow.length}</Badge>
                </div>
                <EventsList events={groupedEvents.tomorrow} showInlineRSVP />
              </div>
            )}

            {groupedEvents.thisWeek.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-h3 font-heading font-semibold text-primary">This Week</h3>
                  <Badge variant="secondary" className="text-xs">{groupedEvents.thisWeek.length}</Badge>
                </div>
                <EventsList events={groupedEvents.thisWeek} showInlineRSVP />
              </div>
            )}

            {groupedEvents.later.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-h3 font-heading font-semibold text-primary">Coming Up</h3>
                  <Badge variant="secondary" className="text-xs">{groupedEvents.later.length}</Badge>
                </div>
                <EventsList events={groupedEvents.later} showInlineRSVP />
              </div>
            )}

            {filteredEvents.length === 0 && (
              <EmptyState
                icon={CalendarIcon}
                title={
                  filters.status === 'past'
                    ? 'No past events'
                    : filters.status === 'upcoming'
                    ? 'No upcoming events'
                    : 'No events found'
                }
                description={
                  filters.searchQuery
                    ? 'Try adjusting your search or filters'
                    : 'Create your first event to get started'
                }
                action={
                  !filters.searchQuery && (
                    <Button onClick={() => setCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Event
                    </Button>
                  )
                }
              />
            )}
          </div>
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
        label="Create Event"
        onClick={() => setCreateDialogOpen(true)}
      />
    </PageContainer>
  );
};

export default Events;
