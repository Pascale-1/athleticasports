import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageContainer } from "@/components/mobile/PageContainer";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Calendar, Users, Trophy, ArrowRight } from "lucide-react";
import { formatEventDate, Event } from "@/lib/events";
import { Link } from "react-router-dom";
import { FilterSheet } from "@/components/common/FilterSheet";
import { useSportFilter } from "@/hooks/useSportFilter";
import { FollowButton } from "@/components/FollowButton";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
  const [activeTab, setActiveTab] = useState<'teams' | 'people'>('teams');

  useEffect(() => {
    fetchData();
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
        .order('start_time', { ascending: true })
        .limit(20);

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
    const matchesSport = !selectedSport || event.type === selectedSport;
    return matchesSearch && matchesSport;
  });

  const filteredTeams = teams.filter(team => {
    const matchesSearch = searchQuery === '' || 
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = !selectedSport || team.sport === selectedSport;
    return matchesSearch && matchesSport;
  });

  const filteredPeople = people.filter(person => {
    const matchesSearch = searchQuery === '' ||
      person.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.bio?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = !selectedSport || person.primary_sport === selectedSport;
    return matchesSearch && matchesSport;
  });

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

        {/* Upcoming Events - Horizontal Scroll */}
        {filteredEvents.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="text-body-large font-semibold">Upcoming Events</h2>
              </div>
              <Link to="/events">
                <Button variant="ghost" size="sm" className="text-primary">
                  See all <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-3 pb-2">
                {filteredEvents.slice(0, 10).map((event) => (
                  <Link key={event.id} to={`/events/${event.id}`} className="inline-block">
                    <Card className="w-[280px] hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-body line-clamp-2">{event.title}</h3>
                            <Badge variant="secondary" className="shrink-0 text-caption">
                              {event.type}
                            </Badge>
                          </div>
                          <p className="text-caption text-muted-foreground">
                            {formatEventDate(event.start_time)}
                          </p>
                          {event.location && (
                            <p className="text-caption text-muted-foreground truncate">
                              📍 {event.location}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}

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
                onClick={() => setActiveTab('people')}
                className={`pb-2 px-1 text-body font-medium border-b-2 transition-colors ${
                  activeTab === 'people'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground'
                }`}
              >
                <Trophy className="h-4 w-4 inline mr-2" />
                Athletes
              </button>
            </div>
            <Link to={activeTab === 'teams' ? '/teams' : '/users'}>
              <Button variant="ghost" size="sm" className="text-primary">
                See all <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Teams Tab */}
          {activeTab === 'teams' && filteredTeams.length > 0 && (
            <div className="grid gap-3">
              {filteredTeams.slice(0, 6).map((team) => (
                <AnimatedCard key={team.id}>
                  <Link to={`/teams/${team.id}`}>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={team.logo_url} />
                            <AvatarFallback>
                              {team.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-body truncate">{team.name}</h3>
                            <p className="text-caption text-muted-foreground">
                              {team.team_members?.[0]?.count || 0} members
                            </p>
                          </div>
                          {team.sport && (
                            <Badge variant="outline" className="text-caption">{team.sport}</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </AnimatedCard>
              ))}
            </div>
          )}

          {/* People Tab */}
          {activeTab === 'people' && filteredPeople.length > 0 && (
            <div className="grid gap-3">
              {filteredPeople.slice(0, 6).map((person) => (
                <AnimatedCard key={person.id}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={person.avatar_url} />
                          <AvatarFallback>
                            {person.display_name?.substring(0, 2).toUpperCase() || 
                             person.username?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-body truncate">
                            {person.display_name || person.username}
                          </h3>
                          {person.bio && (
                            <p className="text-caption text-muted-foreground line-clamp-1">
                              {person.bio}
                            </p>
                          )}
                          {person.primary_sport && (
                            <Badge variant="outline" className="text-caption mt-1">{person.primary_sport}</Badge>
                          )}
                        </div>
                        <FollowButton userId={person.id} />
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              ))}
            </div>
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
    </PageContainer>
  );
};

export default Discover;
