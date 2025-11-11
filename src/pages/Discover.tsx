import { useState, useEffect } from "react";
import { PageContainer } from "@/components/mobile/PageContainer";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Users, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EventCard } from "@/components/events/EventCard";
import { TeamCard } from "@/components/teams/TeamCard";
import { SportFilter } from "@/components/community/SportFilter";
import { useSportFilter } from "@/hooks/useSportFilter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  primary_sport: string | null;
}

const Discover = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [people, setPeople] = useState<Profile[]>([]);
  const { selectedSport, setSelectedSport } = useSportFilter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch upcoming public events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('is_public', true)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(5);

      // Fetch public teams
      // @ts-ignore - TypeScript has issues with deeply nested Supabase types
      const teamsQuery = await supabase
        .from('teams')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(6);
      const teamsData = teamsQuery.data;

      // Fetch active people/profiles
      const peopleQuery = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, bio, primary_sport')
        .neq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(12);
      const peopleData: Profile[] | null = peopleQuery.data as Profile[] | null;

      setEvents(eventsData || []);
      setTeams(teamsData || []);
      setPeople(peopleData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchQuery || 
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === "All" || event.sport === selectedSport;
    return matchesSearch && matchesSport;
  });

  const filteredTeams = teams.filter(team => {
    const matchesSearch = !searchQuery || 
      team.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === "All" || team.sport === selectedSport;
    return matchesSearch && matchesSport;
  });

  const filteredPeople = people.filter(person => {
    const matchesSearch = !searchQuery || 
      person.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.display_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === "All" || person.primary_sport === selectedSport;
    return matchesSearch && matchesSport;
  });

  return (
    <PageContainer>
      <div className="space-y-6 animate-fade-in">
        {/* Header with Search */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold">Discover</h1>
            <p className="text-sm text-muted-foreground">
              Find teams, events, and athletes
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teams, events, people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <SportFilter
            activeSport={selectedSport}
            onSportChange={setSelectedSport}
          />
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-32 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Upcoming Events Section */}
            {filteredEvents.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Upcoming Events
                  </h2>
                </div>
                <div className="space-y-3">
                  {filteredEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            )}

            {/* Featured Teams Section */}
            {filteredTeams.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Featured Teams
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {filteredTeams.map((team) => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      memberCount={0}
                      isMember={false}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Active Athletes Section */}
            {filteredPeople.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Active Athletes
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {filteredPeople.map((person) => (
                    <Card 
                      key={person.id}
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => navigate(`/profile/${person.username}`)}
                    >
                      <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={person.avatar_url || undefined} />
                          <AvatarFallback>
                            {person.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 w-full">
                          <p className="font-medium text-sm truncate">
                            {person.display_name || person.username}
                          </p>
                          {person.primary_sport && (
                            <p className="text-xs text-muted-foreground">
                              {person.primary_sport}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Empty State */}
            {filteredEvents.length === 0 && filteredTeams.length === 0 && filteredPeople.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No results found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
};

export default Discover;
