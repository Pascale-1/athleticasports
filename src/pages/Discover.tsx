import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Users as UsersIcon, Trophy, Loader2 } from "lucide-react";
import { EventCard } from "@/components/events/EventCard";
import { TeamCard } from "@/components/teams/TeamCard";
import { PageContainer } from "@/components/mobile/PageContainer";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { SportFilter } from "@/components/community/SportFilter";
import { FilterSheet } from "@/components/common/FilterSheet";
import { useSportFilter } from "@/hooks/useSportFilter";

interface Profile {
  id: string;
  user_id: string;
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
      const { data: eventsData } = await supabase
        .from("events")
        .select("*")
        .eq("is_public", true)
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true })
        .limit(10);

      const { data: teamsData } = await supabase
        .from("teams")
        .select("*")
        .eq("is_private", false)
        .order("created_at", { ascending: false })
        .limit(10);

      const { data: profilesData } = await supabase
        .from("profiles")
        .select("*")
        .limit(10);

      setEvents(eventsData || []);
      setTeams(teamsData || []);
      setPeople(profilesData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === "All" || event.sport === selectedSport;
    return matchesSearch && matchesSport;
  });

  const filteredTeams = teams.filter((team) => {
    const matchesSearch = team.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === "All" || team.sport === selectedSport;
    return matchesSearch && matchesSport;
  });

  const filteredPeople = people.filter((person) => {
    const matchesSearch =
      person.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.display_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === "All" || person.primary_sport === selectedSport;
    return matchesSearch && matchesSport;
  });

  const activeFilterCount = selectedSport !== "All" ? 1 : 0;

  const handleResetFilters = () => {
    setSelectedSport("All");
  };

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
        <div>
          <h1 className="text-2xl font-bold">Discover</h1>
          <p className="text-sm text-muted-foreground">Find events, teams, and athletes</p>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search everything..."
              value={searchQuery}
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
                <h3 className="text-sm font-medium mb-3">Sport</h3>
                <SportFilter
                  activeSport={selectedSport}
                  onSportChange={setSelectedSport}
                />
              </div>
            </div>
          </FilterSheet>
        </div>

        {/* Upcoming Events */}
        {filteredEvents.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Upcoming Events</h2>
            </div>
            <div className="space-y-3">
              {filteredEvents.map((event, index) => (
                <AnimatedCard key={event.id} delay={0.1 + index * 0.05}>
                  <EventCard {...event} />
                </AnimatedCard>
              ))}
            </div>
          </div>
        )}

        {/* Featured Teams */}
        {filteredTeams.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Featured Teams</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredTeams.map((team, index) => (
                <AnimatedCard key={team.id} delay={0.1 + index * 0.05}>
                  <TeamCard team={team} isMember={false} />
                </AnimatedCard>
              ))}
            </div>
          </div>
        )}

        {/* Active Athletes */}
        {filteredPeople.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Active Athletes</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredPeople.map((person, index) => (
                <AnimatedCard key={person.id} delay={0.1 + index * 0.05}>
                  <Card
                    className="p-4 cursor-pointer hover-lift"
                    onClick={() => navigate(`/users/${person.user_id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {person.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {person.display_name || person.username}
                        </p>
                        {person.primary_sport && (
                          <p className="text-xs text-muted-foreground">{person.primary_sport}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                </AnimatedCard>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredEvents.length === 0 && filteredTeams.length === 0 && filteredPeople.length === 0 && (
          <Card className="p-8 text-center">
            <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No Results Found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </Card>
        )}
      </div>
    </PageContainer>
  );
};

export default Discover;
