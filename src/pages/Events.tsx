import { useState } from "react";
import { PageContainer } from "@/components/mobile/PageContainer";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon, List, LayoutGrid, Trophy, Users, Zap } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { isToday, isTomorrow, isThisWeek, isFuture } from "date-fns";
import type { Event } from "@/lib/events";

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-2 font-bold">Events</h1>
            <p className="text-caption text-muted-foreground">
              Discover and manage training, meetups, and matches
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Create</span>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-2">
          <Input
            placeholder="Search events..."
            value={filters.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <FilterSheet 
            activeCount={activeFilterCount}
            onApply={() => {}}
            onReset={handleResetFilters}
          >
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select value={filters.status} onValueChange={setStatusFilter}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="past">Past</SelectItem>
                    <SelectItem value="all">All Events</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Public Events Only</Label>
                <Switch
                  checked={filters.isPublic === true}
                  onCheckedChange={(checked) => setPublicFilter(checked ? true : undefined)}
                />
              </div>
            </div>
          </FilterSheet>
        </div>

        {/* Event Type Pills + View Toggle */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
            <Button
              variant={activeEventType === 'all' ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setActiveEventType('all');
                setTypeFilter('all');
              }}
              className="h-9 w-9 p-0 relative"
            >
              <LayoutGrid className="h-4 w-4" />
              {events.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  {events.length}
                </span>
              )}
            </Button>
            
            <Button
              variant={activeEventType === 'training' ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setActiveEventType('training');
                setTypeFilter('training');
              }}
              className="h-9 w-9 p-0 relative"
            >
              <Trophy className="h-4 w-4" />
              {events.filter(e => e.type === 'training').length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  {events.filter(e => e.type === 'training').length}
                </span>
              )}
            </Button>
            
            <Button
              variant={activeEventType === 'meetup' ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setActiveEventType('meetup');
                setTypeFilter('meetup');
              }}
              className="h-9 w-9 p-0 relative"
            >
              <Users className="h-4 w-4" />
              {events.filter(e => e.type === 'meetup').length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  {events.filter(e => e.type === 'meetup').length}
                </span>
              )}
            </Button>
            
            <Button
              variant={activeEventType === 'match' ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setActiveEventType('match');
                setTypeFilter('match');
              }}
              className="h-9 w-9 p-0 relative"
            >
              <Zap className="h-4 w-4" />
              {events.filter(e => e.type === 'match').length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  {events.filter(e => e.type === 'match').length}
                </span>
              )}
            </Button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-9 px-3"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="h-9 px-3"
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
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
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2 -mx-4 px-4">
                  <h3 className="text-lg font-bold text-primary">Today</h3>
                </div>
                <EventsList events={groupedEvents.today} showInlineRSVP />
              </div>
            )}
            {groupedEvents.tomorrow.length > 0 && (
              <div className="space-y-3">
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2 -mx-4 px-4">
                  <h3 className="text-lg font-bold">Tomorrow</h3>
                </div>
                <EventsList events={groupedEvents.tomorrow} showInlineRSVP />
              </div>
            )}
            {groupedEvents.thisWeek.length > 0 && (
              <div className="space-y-3">
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2 -mx-4 px-4">
                  <h3 className="text-lg font-bold">This Week</h3>
                </div>
                <EventsList events={groupedEvents.thisWeek} showInlineRSVP />
              </div>
            )}
            {groupedEvents.later.length > 0 && (
              <div className="space-y-3">
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2 -mx-4 px-4">
                  <h3 className="text-lg font-bold">Coming Up</h3>
                </div>
                <EventsList events={groupedEvents.later} showInlineRSVP />
              </div>
            )}
            {filteredEvents.length === 0 && (
              <EventsList
                events={[]}
                emptyTitle={
                  filters.status === 'past'
                    ? 'No past events'
                    : filters.status === 'upcoming'
                    ? 'No upcoming events'
                    : 'No events found'
                }
                emptyDescription={
                  filters.searchQuery
                    ? 'Try adjusting your search or filters'
                    : 'Create your first event to get started'
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
    </PageContainer>
  );
};

export default Events;
