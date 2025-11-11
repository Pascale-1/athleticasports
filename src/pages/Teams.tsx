import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Users, Search as SearchIcon } from "lucide-react";
import { Team } from "@/lib/teams";
import { TeamSearchBar } from "@/components/teams/TeamSearchBar";
import { TeamCarousel } from "@/components/teams/TeamCarousel";
import { SwipeableTeamCard } from "@/components/teams/SwipeableTeamCard";
import { TeamCardSkeleton } from "@/components/teams/TeamCardSkeleton";
import { FAB } from "@/components/mobile/FAB";
import { EmptyState } from "@/components/EmptyState";
import { useTeamFilters } from "@/hooks/useTeamFilters";
import { toast } from "sonner";
import { PullToRefresh } from "@/components/animations/PullToRefresh";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { motion } from "framer-motion";
import { FilterSheet } from "@/components/common/FilterSheet";
import { SportFilter } from "@/components/community/SportFilter";

const Teams = () => {
  const navigate = useNavigate();
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [publicTeams, setPublicTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  
  const {
    searchQuery,
    setSearchQuery,
    activeSport,
    setActiveSport,
    filteredTeams: filteredMyTeams,
  } = useTeamFilters(myTeams);
  
  const {
    filteredTeams: filteredPublicTeams,
  } = useTeamFilters(publicTeams.filter(team => !myTeams.some(mt => mt.id === team.id)));

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

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
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchTeams();
  };

  const handleLeaveTeam = async (teamId: string) => {
    if (!userId) return;
    try {
      await supabase
        .from("team_members")
        .delete()
        .eq("team_id", teamId)
        .eq("user_id", userId);
      
      setMyTeams(prev => prev.filter(t => t.id !== teamId));
      toast.success("Left team successfully");
    } catch (error) {
      console.error("Error leaving team:", error);
      toast.error("Failed to leave team");
    }
  };

  const handleShareTeam = (teamId: string) => {
    const url = `${window.location.origin}/teams/${teamId}`;
    if (navigator.share) {
      navigator.share({ url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Team link copied to clipboard");
    }
  };

  const featuredTeams = publicTeams.slice(0, 5);

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
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <motion.div 
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold break-words max-w-full">Teams</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                {myTeams.length + publicTeams.length} teams • {Object.values(memberCounts).reduce((a, b) => a + b, 0)} members
              </p>
            </div>
            <Button 
              onClick={() => navigate("/teams/create")} 
              className="hidden sm:flex w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <TeamSearchBar 
              value={searchQuery} 
              onChange={setSearchQuery}
            />
          </motion.div>

          {/* Filter Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <FilterSheet 
              activeCount={activeSport !== "All" ? 1 : 0}
              onApply={() => {}}
              onReset={() => setActiveSport("All")}
            >
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-3">Sport</h3>
                  <SportFilter
                    activeSport={activeSport}
                    onSportChange={setActiveSport}
                  />
                </div>
              </div>
            </FilterSheet>
          </motion.div>

          {/* Featured Teams Carousel */}
          {!searchQuery && featuredTeams.length > 0 && (
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <h2 className="text-lg sm:text-xl font-semibold">Featured Teams</h2>
              <TeamCarousel 
                teams={featuredTeams}
                memberCounts={memberCounts}
                myTeamIds={myTeams.map(t => t.id)}
              />
            </motion.div>
          )}

          {/* My Teams Section */}
          {filteredMyTeams.length > 0 && (
            <motion.div 
              className="space-y-3 sm:space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-lg sm:text-xl font-semibold">
                My Teams ({filteredMyTeams.length})
              </h2>
              <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
                {filteredMyTeams.map((team, index) => (
                  <AnimatedCard key={team.id} delay={0.35 + index * 0.05} hover={false}>
                    <SwipeableTeamCard
                      team={team}
                      memberCount={memberCounts[team.id] || 0}
                      isMember={true}
                      onLeave={() => handleLeaveTeam(team.id)}
                      onSettings={() => navigate(`/teams/${team.id}/settings`)}
                    />
                  </AnimatedCard>
                ))}
              </div>
            </motion.div>
          )}

          {/* Discover Public Teams Section */}
          <motion.div 
            className="space-y-3 sm:space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-lg sm:text-xl font-semibold">
              {searchQuery ? `Search Results (${filteredPublicTeams.length})` : "Discover Public Teams"}
            </h2>
            
            {loading ? (
              <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
                {[...Array(6)].map((_, i) => (
                  <TeamCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredPublicTeams.length > 0 ? (
              <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
                {filteredPublicTeams.map((team, index) => (
                  <AnimatedCard key={team.id} delay={0.45 + index * 0.05} hover={false}>
                    <SwipeableTeamCard
                      team={team}
                      memberCount={memberCounts[team.id] || 0}
                      isMember={false}
                      onJoin={() => navigate(`/teams/${team.id}`)}
                      onShare={() => handleShareTeam(team.id)}
                    />
                  </AnimatedCard>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={searchQuery ? SearchIcon : Users}
                title={searchQuery ? "No teams found" : activeSport !== "All" ? `No ${activeSport} teams yet` : "No public teams available"}
                description={searchQuery ? "Try adjusting your search terms or filters" : activeSport !== "All" ? "Be the first to create one!" : "Create the first team for your community"}
                action={
                  searchQuery ? (
                    <Button onClick={() => setSearchQuery("")} variant="outline">
                      Clear Search
                    </Button>
                  ) : (
                    <Button onClick={() => navigate("/teams/create")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Team
                    </Button>
                  )
                }
              />
            )}
          </motion.div>
        </motion.div>
      </PullToRefresh>

      {/* Floating Action Button (Mobile) */}
      <FAB
        icon={<Plus className="h-5 w-5" />}
        label="Create Team"
        onClick={() => navigate("/teams/create")}
      />
    </div>
  );
};

export default Teams;
