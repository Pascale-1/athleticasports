import { useState } from "react";
import { PageContainer } from "@/components/mobile/PageContainer";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon, List, LayoutGrid, Trophy, Users, Zap, Coffee, Search, Dumbbell } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FAB } from "@/components/mobile/FAB";

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
      <div className="pb-20 space-y-4 sm:space-y-6 animate-fade-in">
        {/* Header - Consolidated */}
        <div className="space-y-4">
          {/* Row 1 - Mobile: Title + Dropdown, Desktop: Title + Pills + View + Create */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-heading font-bold">Events</h1>
              
              {/* Mobile: Event Type Dropdown */}
              <Select 
                value={activeEventType} 
                onValueChange={(value: any) => {
                  setActiveEventType(value);
                  setTypeFilter(value);
                }}
              >
                <SelectTrigger className="w-32 h-10 md:hidden">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="meetup">Meetup</SelectItem>
                  <SelectItem value="match">Match</SelectItem>
                </SelectContent>
              </Select>

              {/* Desktop: Event Type Pills */}
              <div className="hidden md:flex gap-1 bg-muted p-1 rounded-lg">
                <Button size="sm" variant={activeEventType === 'all' ? 'default' : 'ghost'} className="h-10 px-3 text-xs" onClick={() => { setActiveEventType('all'); setTypeFilter('all'); }}>
                  All
                </Button>
                <Button size="sm" variant={activeEventType === 'training' ? 'default' : 'ghost'} className="h-10 px-3 text-xs" onClick={() => { setActiveEventType('training'); setTypeFilter('training'); }}>
                  Train
                </Button>
                <Button size="sm" variant={activeEventType === 'meetup' ? 'default' : 'ghost'} className="h-10 px-3 text-xs" onClick={() => { setActiveEventType('meetup'); setTypeFilter('meetup'); }}>
                  Meet
                </Button>
                <Button size="sm" variant={activeEventType === 'match' ? 'default' : 'ghost'} className="h-10 px-3 text-xs" onClick={() => { setActiveEventType('match'); setTypeFilter('match'); }}>
                  Match
                </Button>
              </div>
            </div>

            {/* View Toggle + Create (Desktop) */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex gap-1 bg-muted p-1 rounded-lg">
                <Button size="sm" variant={viewMode === 'list' ? 'default' : 'ghost'} className="h-10 w-10 p-0" onClick={() => setViewMode('list')}>
                  <List className="h-4 w-4" />
                </Button>
                <Button size="sm" variant={viewMode === 'calendar' ? 'default' : 'ghost'} className="h-10 w-10 p-0" onClick={() => setViewMode('calendar')}>
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={() => setCreateDialogOpen(true)} size="default" className="gap-2">
                <Plus className="h-4 w-4" />
                Create
              </Button>
            </div>

            {/* Mobile: View Toggle */}
            <div className="flex md:hidden gap-1 bg-muted p-1 rounded-lg">
              <Button size="sm" variant={viewMode === 'list' ? 'default' : 'ghost'} className="h-10 w-10 p-0" onClick={() => setViewMode('list')}>
                <List className="h-4 w-4" />
              </Button>
              <Button size="sm" variant={viewMode === 'calendar' ? 'default' : 'ghost'} className="h-10 w-10 p-0" onClick={() => setViewMode('calendar')}>
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Row 2 - Search + Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={filters.searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <FilterSheet activeCount={activeFilterCount} onApply={() => {}} onReset={handleResetFilters}>
              <div className="space-y-6">
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold">Events</h1>
            <p className="text-sm font-body text-muted-foreground mt-1">
              Discover and manage training, meetups, and matches
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} size="default" className="gap-2 font-heading font-semibold hidden md:flex">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={filters.searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
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
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg flex-wrap">
            <Button
              variant={activeEventType === 'all' ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setActiveEventType('all');
                setTypeFilter('all');
              }}
              className="h-9 px-3 gap-1.5"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="text-xs font-medium">All</span>
              {events.length > 0 && (
                <Badge 
                  variant={activeEventType === 'all' ? "secondary" : "outline"}
                  className="h-5 min-w-5 px-1.5 text-[10px]"
                >
                  {events.length}
                </Badge>
              )}
            </Button>
            
            <Button
              variant={activeEventType === 'training' ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setActiveEventType('training');
                setTypeFilter('training');
              }}
              className="h-9 px-3 gap-1.5"
            >
              <Dumbbell className="h-4 w-4" />
              <span className="text-xs font-medium">Training</span>
              {events.filter(e => e.type === 'training').length > 0 && (
                <Badge 
                  variant={activeEventType === 'training' ? "secondary" : "outline"}
                  className="h-5 min-w-5 px-1.5 text-[10px]"
                >
                  {events.filter(e => e.type === 'training').length}
                </Badge>
              )}
            </Button>
            
            <Button
              variant={activeEventType === 'meetup' ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setActiveEventType('meetup');
                setTypeFilter('meetup');
              }}
              className="h-9 px-3 gap-1.5"
            >
              <Coffee className="h-4 w-4" />
              <span className="text-xs font-medium">Meetup</span>
              {events.filter(e => e.type === 'meetup').length > 0 && (
                <Badge 
                  variant={activeEventType === 'meetup' ? "secondary" : "outline"}
                  className="h-5 min-w-5 px-1.5 text-[10px]"
                >
                  {events.filter(e => e.type === 'meetup').length}
                </Badge>
              )}
            </Button>
            
            <Button
              variant={activeEventType === 'match' ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setActiveEventType('match');
                setTypeFilter('match');
              }}
              className="h-9 px-3 gap-1.5"
            >
              <Trophy className="h-4 w-4" />
              <span className="text-xs font-medium">Match</span>
              {events.filter(e => e.type === 'match').length > 0 && (
                <Badge 
                  variant={activeEventType === 'match' ? "secondary" : "outline"}
                  className="h-5 min-w-5 px-1.5 text-[10px]"
                >
                  {events.filter(e => e.type === 'match').length}
                </Badge>
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

        {/* Create Event CTA Banner */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all border-dashed border-2 bg-primary/5 hover:bg-primary/10"
          onClick={() => setCreateDialogOpen(true)}
        >
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Host an Event</h3>
                <p className="text-xs text-muted-foreground">Create a match, training, or meetup</p>
              </div>
            </div>
            <Button size="sm" className="hidden sm:flex">
              Create
            </Button>
          </CardContent>
        </Card>

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
                <div className="sticky top-0 z-20 -mt-6 pt-6 pb-3">
                  <div className="bg-background/90 backdrop-blur-md border-b border-border/50 -mx-4 px-4 py-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg md:text-xl font-heading font-bold text-primary">
                        Today
                      </h3>
                      <Badge variant="secondary" className="text-xs font-body">
                        {groupedEvents.today.length}
                      </Badge>
                    </div>
                  </div>
                </div>
                <EventsList events={groupedEvents.today} showInlineRSVP />
              </div>
            )}

            {/* Inline CTA between Today and Tomorrow */}
            {groupedEvents.today.length > 0 && groupedEvents.tomorrow.length > 0 && (
              <Card 
                className="cursor-pointer hover:shadow-md transition-all border-dashed border-2 bg-primary/5 hover:bg-primary/10 mx-auto max-w-md"
                onClick={() => setCreateDialogOpen(true)}
              >
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-sm">Create Your Event</h3>
                    <p className="text-xs text-muted-foreground font-body">Host a match, training, or meetup</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {groupedEvents.tomorrow.length > 0 && (
              <div className="space-y-3">
                <div className="sticky top-0 z-20 -mt-6 pt-6 pb-3">
                  <div className="bg-background/90 backdrop-blur-md border-b border-border/50 -mx-4 px-4 py-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg md:text-xl font-heading font-bold text-primary">
                        Tomorrow
                      </h3>
                      <Badge variant="secondary" className="text-xs font-body">
                        {groupedEvents.tomorrow.length}
                      </Badge>
                    </div>
                  </div>
                </div>
                <EventsList events={groupedEvents.tomorrow} showInlineRSVP />
              </div>
            )}

            {groupedEvents.thisWeek.length > 0 && (
              <div className="space-y-3">
                <div className="sticky top-0 z-20 -mt-6 pt-6 pb-3">
                  <div className="bg-background/90 backdrop-blur-md border-b border-border/50 -mx-4 px-4 py-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg md:text-xl font-heading font-bold text-primary">
                        This Week
                      </h3>
                      <Badge variant="secondary" className="text-xs font-body">
                        {groupedEvents.thisWeek.length}
                      </Badge>
                    </div>
                  </div>
                </div>
                <EventsList events={groupedEvents.thisWeek} showInlineRSVP />
              </div>
            )}

            {groupedEvents.later.length > 0 && (
              <div className="space-y-3">
                <div className="sticky top-0 z-20 -mt-6 pt-6 pb-3">
                  <div className="bg-background/90 backdrop-blur-md border-b border-border/50 -mx-4 px-4 py-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg md:text-xl font-heading font-bold text-primary">
                        Coming Up
                      </h3>
                      <Badge variant="secondary" className="text-xs font-body">
                        {groupedEvents.later.length}
                      </Badge>
                    </div>
                  </div>
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

      {/* Mobile FAB */}
      <FAB
        icon={<Plus className="h-6 w-6" />}
        label="Create Event"
        onClick={() => setCreateDialogOpen(true)}
      />
    </PageContainer>
  );
};

export default Events;
