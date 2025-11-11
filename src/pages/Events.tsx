import { useState } from "react";
import { PageContainer } from "@/components/mobile/PageContainer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar as CalendarIcon, List } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { useEventFilters } from "@/hooks/useEventFilters";
import { CreateEventDialog } from "@/components/events/CreateEventDialog";
import { EventsList } from "@/components/events/EventsList";
import { EventFilters } from "@/components/events/EventFilters";
import { EventCalendar } from "@/components/events/EventCalendar";
import { Skeleton } from "@/components/ui/skeleton";

const Events = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  
  const { events, loading } = useEvents(undefined, { status: 'upcoming' });
  
  const {
    filters,
    filteredEvents,
    setTypeFilter,
    setStatusFilter,
    setSearchQuery,
    setPublicFilter,
  } = useEventFilters(events);

  return (
    <PageContainer>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Events</h1>
            <p className="text-sm text-muted-foreground">
              Discover and manage training, meetups, and matches
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Create</span>
          </Button>
        </div>

        {/* Filters */}
        <EventFilters
          searchQuery={filters.searchQuery}
          onSearchChange={setSearchQuery}
          typeFilter={filters.type}
          onTypeChange={setTypeFilter}
          statusFilter={filters.status}
          onStatusChange={setStatusFilter}
          showPublicFilter
          publicFilter={filters.isPublic}
          onPublicFilterChange={setPublicFilter}
        />

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendar
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : viewMode === 'list' ? (
          <EventsList
            events={filteredEvents}
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
        ) : (
          <EventCalendar events={filteredEvents} />
        )}
      </div>

      <CreateEventDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </PageContainer>
  );
};

export default Events;
