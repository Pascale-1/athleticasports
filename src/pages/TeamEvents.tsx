import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { PageContainer } from "@/components/mobile/PageContainer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar as CalendarIcon, List, LayoutGrid } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { useTeam } from "@/hooks/useTeam";
import { EventsList } from "@/components/events/EventsList";
import { EventCalendar } from "@/components/events/EventCalendar";
import { Skeleton } from "@/components/ui/skeleton";
import { isToday, isTomorrow, isThisWeek, isFuture } from "date-fns";
import type { Event } from "@/lib/events";

const TeamEvents = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'compact'>('list');
  
  const { team, isLoading: teamLoading } = useTeam(teamId || null);
  const { events, loading: eventsLoading } = useEvents(teamId, { status: 'upcoming' });
  
  const loading = teamLoading || eventsLoading;

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

  const groupedEvents = groupEventsByTime(events);

  return (
    <PageContainer>
      <div className="space-y-6 animate-fade-in">
        {/* Header with Back Navigation */}
        <div className="flex items-start gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(`/teams/${teamId}`)}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-caption text-muted-foreground mb-1">
              <Link to="/discover" className="hover:text-foreground transition-colors">
                Discover
              </Link>
              <span>/</span>
              <Link to={`/teams/${teamId}`} className="hover:text-foreground transition-colors truncate">
                {team?.name}
              </Link>
            </div>
            <h1 className="text-heading-2 font-bold">Team Events</h1>
            <p className="text-caption text-muted-foreground">
              View and RSVP to upcoming events
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="flex-1 sm:flex-none"
          >
            <List className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">List</span>
          </Button>
          <Button
            variant={viewMode === 'compact' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('compact')}
            className="flex-1 sm:flex-none"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Compact</span>
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
            className="flex-1 sm:flex-none"
          >
            <CalendarIcon className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Calendar</span>
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : viewMode === 'calendar' ? (
          <EventCalendar events={events} />
        ) : viewMode === 'compact' ? (
          <EventsList
            events={events}
            variant="compact"
            showInlineRSVP
            emptyTitle="No upcoming events"
            emptyDescription="Check back later for new team events"
          />
        ) : (
          <div className="space-y-6">
            {groupedEvents.today.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-body-large font-semibold text-primary">Today</h3>
                <EventsList events={groupedEvents.today} showInlineRSVP />
              </div>
            )}
            {groupedEvents.tomorrow.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-body-large font-semibold">Tomorrow</h3>
                <EventsList events={groupedEvents.tomorrow} showInlineRSVP />
              </div>
            )}
            {groupedEvents.thisWeek.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-body-large font-semibold">This Week</h3>
                <EventsList events={groupedEvents.thisWeek} showInlineRSVP />
              </div>
            )}
            {groupedEvents.later.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-body-large font-semibold">Coming Up</h3>
                <EventsList events={groupedEvents.later} showInlineRSVP />
              </div>
            )}
            {events.length === 0 && (
              <EventsList
                events={[]}
                emptyTitle="No upcoming events"
                emptyDescription="Check back later for new team events"
              />
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default TeamEvents;
