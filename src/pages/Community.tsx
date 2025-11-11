import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Search as SearchIcon } from "lucide-react";
import { Team } from "@/lib/teams";
import { SportFilter } from "@/components/community/SportFilter";
import { PeopleTab } from "@/components/community/PeopleTab";
import { TeamsTab } from "@/components/community/TeamsTab";

import { PullToRefresh } from "@/components/animations/PullToRefresh";
import { useSportFilter } from "@/hooks/useSportFilter";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  primary_sport: string | null;
  created_at: string;
  roles: string[];
}

const Community = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("people");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  // People data
  const [profiles, setProfiles] = useState<Profile[]>([]);
  
  // Teams data
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [publicTeams, setPublicTeams] = useState<Team[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  
  const { selectedSport, setSelectedSport } = useSportFilter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchProfiles(), fetchTeams()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role');

      const profilesWithRoles = profilesData.map(profile => ({
        ...profile,
        roles: rolesData
          ?.filter(r => r.user_id === profile.user_id)
          .map(r => r.role) || []
      }));

      setProfiles(profilesWithRoles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error("Failed to load users");
    }
  };

  const fetchTeams = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: myTeamsData } = await supabase
          .from("team_members")
          .select("team_id, teams(*)")
          .eq("user_id", user.id)
          .eq("status", "active");

        const teams = myTeamsData?.map((item: any) => item.teams).filter(Boolean) || [];
        setMyTeams(teams);

        for (const team of teams) {
          const { data: countData } = await supabase.rpc("get_team_member_count", {
            _team_id: team.id,
          });
          if (countData !== null) {
            setMemberCounts((prev) => ({ ...prev, [team.id]: countData }));
          }
        }
      }

      const { data: publicTeamsData } = await supabase
        .from("teams")
        .select("*")
        .eq("is_private", false)
        .order("created_at", { ascending: false })
        .limit(20);

      setPublicTeams(publicTeamsData || []);

      for (const team of publicTeamsData || []) {
        const { data: countData } = await supabase.rpc("get_team_member_count", {
          _team_id: team.id,
        });
        if (countData !== null) {
          setMemberCounts((prev) => ({ ...prev, [team.id]: countData }));
        }
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast.error("Failed to load teams");
    }
  };

  const handleRefresh = async () => {
    await fetchData();
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-6xl pb-24">
      <PullToRefresh onRefresh={handleRefresh}>
        <motion.div 
          className="space-y-4 sm:space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Community</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Connect with athletes and teams
              </p>
            </div>
            <Button 
              onClick={() => navigate("/teams/create")} 
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="people">People</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
            </TabsList>

            {/* Search Bar */}
            <div className="mt-4 relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={activeTab === "people" ? "Search people..." : "Search teams..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Sport Filter */}
            <div className="mt-4">
              <SportFilter 
                activeSport={selectedSport}
                onSportChange={setSelectedSport}
              />
            </div>

            {/* People Tab */}
            <TabsContent value="people" className="mt-6">
              <PeopleTab profiles={filteredProfiles} activeSport={selectedSport} />
            </TabsContent>

            {/* Teams Tab */}
            <TabsContent value="teams" className="mt-6">
              <TeamsTab 
                myTeams={myTeams}
                publicTeams={publicTeams}
                memberCounts={memberCounts}
                activeSport={selectedSport}
                onTeamsUpdate={fetchTeams}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </PullToRefresh>

    </div>
  );
};

export default Community;
