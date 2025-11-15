import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageContainer } from "@/components/mobile/PageContainer";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Calendar, Users, Trophy, ArrowRight, Plus, MapPin, ChevronRight } from "lucide-react";
import { CreateEventDialog } from "@/components/events/CreateEventDialog";
import { EventsList } from "@/components/events/EventsList";
import { format, isToday, isTomorrow, isThisWeek, startOfWeek, endOfWeek } from "date-fns";
import { cn } from "@/lib/utils";
import { formatEventDate, Event } from "@/lib/events";
import { Link } from "react-router-dom";
import { FilterSheet } from "@/components/common/FilterSheet";
import { useSportFilter } from "@/hooks/useSportFilter";
import { FollowButton } from "@/components/FollowButton";
import { Button } from "@/components/ui/button";

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  primary_sport: string | null;
  user_roles?: { role: { name: string } }[];
}

const Discover = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [people, setPeople] = useState<Profile[]>([]);
  const { selectedSport, setSelectedSport } = useSportFilter();
  const [activeTab, setActiveTab] = useState<'teams' | 'events'>('events');
  const [createEventDialogOpen, setCreateEventDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();

    // Subscribe to realtime events changes
    const channel = supabase
      .channel('discover-events')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch public events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('is_public', true)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      // Fetch teams with member counts (excluding private teams)
      const { data: teamsData } = await supabase
        .from('teams')
        .select('*, team_members(count)')
        .neq('is_private', true)
        .order('created_at', { ascending: false })
        .limit(20);

      // Fetch profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      setEvents(eventsData || []);
      setTeams(teamsData || []);
      setPeople(profilesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = searchQuery === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = !selectedSport || selectedSport === 'All' || 
      event.type?.toLowerCase() === selectedSport.toLowerCase();
    return matchesSearch && matchesSport;
  });

  const filteredTeams = teams.filter(team => {
    const matchesSearch = searchQuery === '' || 
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = !selectedSport || selectedSport === 'All' || 
      team.sport?.toLowerCase() === selectedSport.toLowerCase();
    return matchesSearch && matchesSport;
  });

  const filteredPeople = people.filter(person => {
    const matchesSearch = searchQuery === '' ||
      person.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.bio?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = !selectedSport || selectedSport === 'All' || 
      person.primary_sport?.toLowerCase() === selectedSport.toLowerCase();
    return matchesSearch && matchesSport;
  });

  const groupEventsByTime = (events: Event[]) => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    return {
      today: events.filter(e => isToday(new Date(e.start_time))),
      tomorrow: events.filter(e => isTomorrow(new Date(e.start_time))),
      thisWeek: events.filter(e => {
        const date = new Date(e.start_time);
        return !isToday(date) && !isTomorrow(date) && isThisWeek(date);
      }),
      comingUp: events.filter(e => {
        const date = new Date(e.start_time);
        return date > weekEnd;
      })
    };
  };

  const groupedEvents = groupEventsByTime(filteredEvents);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-2 font-bold">Discover</h1>
            <p className="text-caption text-muted-foreground">
              Find events, teams, and connect with athletes
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search events, teams, people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <FilterSheet 
            activeCount={selectedSport ? 1 : 0}
            onApply={() => {}}
            onReset={() => setSelectedSport(null)}
          >
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Sport</label>
                <select
                  value={selectedSport || ''}
                  onChange={(e) => setSelectedSport(e.target.value || null)}
                  className="w-full mt-2 p-2 border rounded-md"
                >
                  <option value="">All Sports</option>
                  <option value="basketball">Basketball</option>
                  <option value="soccer">Soccer</option>
                  <option value="volleyball">Volleyball</option>
                  <option value="tennis">Tennis</option>
                </select>
              </div>
            </div>
          </FilterSheet>
        </div>


        {/* Community Tabs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('teams')}
                className={`pb-2 px-1 text-body font-medium border-b-2 transition-colors ${
                  activeTab === 'teams'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground'
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                Teams
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`pb-2 px-1 text-body font-medium border-b-2 transition-colors ${
                  activeTab === 'events'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground'
                }`}
              >
                <Calendar className="h-4 w-4 inline mr-2" />
                All Events
              </button>
            </div>
            {activeTab === 'teams' && (
              <Link to="/teams">
                <Button variant="ghost" size="sm" className="text-primary">
                  See all <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>

          {/* Teams Tab */}
          {activeTab === 'teams' && (
            <>
              {filteredTeams.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {filteredTeams.slice(0, 6).map((team, index) => (
                    <AnimatedCard key={team.id}>
                      <Link to={`/teams/${team.id}`}>
                        <Card className="hover:shadow-md transition-shadow h-full">
                          <CardContent className="p-3">
                            <div className="flex flex-col items-center text-center gap-2">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={team.logo_url} />
                                <AvatarFallback>
                                  {team.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="w-full min-w-0">
                                <h3 className="font-semibold text-sm truncate">{team.name}</h3>
                                <p className="text-xs text-muted-foreground">
                                  {team.team_members?.[0]?.count || 0} members
                                </p>
                                {team.sport && (
                                  <Badge variant="outline" className="text-xs mt-1">{team.sport}</Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </AnimatedCard>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="font-semibold text-body mb-1">No Teams Found</h3>
                    <p className="text-caption text-muted-foreground mb-4">
                      {searchQuery || selectedSport 
                        ? 'Try adjusting your search or filters'
                        : 'Be the first to create a team!'}
                    </p>
                    {(searchQuery || selectedSport) && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedSport(null);
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-body-large font-semibold">All Events</h3>
                <Button onClick={() => setCreateEventDialogOpen(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </div>
              
              {filteredEvents.length > 0 ? (
                <div className="space-y-6">
                  {groupedEvents.today.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-body font-semibold text-foreground">Today</h3>
                      <EventsList 
                        events={groupedEvents.today}
                        variant="compact"
                        showInlineRSVP={true}
                        emptyTitle=""
                        emptyDescription=""
                      />
                    </div>
                  )}

                  {groupedEvents.tomorrow.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-body font-semibold text-foreground">Tomorrow</h3>
                      <EventsList 
                        events={groupedEvents.tomorrow}
                        variant="compact"
                        showInlineRSVP={true}
                        emptyTitle=""
                        emptyDescription=""
                      />
                    </div>
                  )}

                  {groupedEvents.thisWeek.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-body font-semibold text-foreground">This Week</h3>
                      <EventsList 
                        events={groupedEvents.thisWeek}
                        variant="compact"
                        showInlineRSVP={true}
                        emptyTitle=""
                        emptyDescription=""
                      />
                    </div>
                  )}

                  {groupedEvents.comingUp.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-body font-semibold text-foreground">Coming Up</h3>
                      <EventsList 
                        events={groupedEvents.comingUp}
                        variant="compact"
                        showInlineRSVP={true}
                        emptyTitle=""
                        emptyDescription=""
                      />
                    </div>
                  )}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">No Events Found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery || selectedSport
                      ? "Try adjusting your filters to find events."
                      : "Be the first to create an event!"}
                  </p>
                  {(searchQuery || selectedSport) && (
                    <Button variant="outline" onClick={() => {
                      setSearchQuery('');
                      setSelectedSport(null);
                    }}>
                      Clear Filters
                    </Button>
                  )}
                </Card>
              )}
            </>
          )}
        </div>

        {/* No Results */}
        {!loading && filteredEvents.length === 0 && filteredTeams.length === 0 && filteredPeople.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-semibold text-body mb-1">No Results Found</h3>
              <p className="text-caption text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateEventDialog
        open={createEventDialogOpen}
        onOpenChange={setCreateEventDialogOpen}
        onCreated={fetchData}
      />
    </PageContainer>
  );
};

export default Discover;
