import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Users, Search as SearchIcon } from "lucide-react";
import { Team } from "@/lib/teams";
import { Card, CardContent } from "@/components/ui/card";
import { TeamSearchBar } from "@/components/teams/TeamSearchBar";

import { TeamCard } from "@/components/teams/TeamCard";
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
  const location = useLocation();
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [publicTeams, setPublicTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [showAllTeams, setShowAllTeams] = useState(false);
  
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
    const params = new URLSearchParams(location.search);
    const filter = params.get('filter');
    
    if (filter === 'my-teams') {
      setShowAllTeams(false);
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location]);

  useEffect(() => {
    fetchTeams();
    
    // Subscribe to teams changes
    const teamsChannel = supabase
      .channel('teams-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teams' },
        () => fetchTeams()
      )
      .subscribe();
      
    // Subscribe to team_members changes (for myTeams)
    const membersChannel = supabase
      .channel('team-members-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'team_members' },
        () => fetchTeams()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(teamsChannel);
      supabase.removeChannel(membersChannel);
    };
  }, []);

  const fetchTeams = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      let allTeamIds: string[] = [];

      if (user) {
        const { data: myTeamsData } = await supabase
          .from("team_members")
          .select("team_id, teams(*)")
          .eq("user_id", user.id)
          .eq("status", "active");

        const teams = myTeamsData?.map((item: any) => item.teams).filter(Boolean) || [];
        setMyTeams(teams);
        allTeamIds.push(...teams.map((t: any) => t.id));
      }

      const { data: publicTeamsData } = await supabase
        .from("teams")
        .select("*")
        .eq("is_private", false)
        .order("created_at", { ascending: false })
        .limit(20);

      setPublicTeams(publicTeamsData || []);
      allTeamIds.push(...(publicTeamsData || []).map((t: any) => t.id));

      // Batch fetch all member counts in parallel
      if (allTeamIds.length > 0) {
        const countPromises = allTeamIds.map(teamId =>
          supabase.rpc("get_team_member_count", { _team_id: teamId })
        );
        
        const countResults = await Promise.all(countPromises);
        
        const newCounts: Record<string, number> = {};
        allTeamIds.forEach((teamId, index) => {
          const result = countResults[index];
          if (result.data !== null && result.data !== undefined) {
            newCounts[teamId] = result.data;
          }
        });
        
        setMemberCounts(newCounts);
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
              <h1 className="text-2xl sm:text-3xl font-bold">Teams</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {myTeams.length} team{myTeams.length !== 1 ? 's' : ''} • {publicTeams.length} available
              </p>
            </div>
            <Button 
              onClick={() => navigate("/teams/create")} 
              className="hidden sm:flex w-full sm:w-auto"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </motion.div>

          {/* Unified Search & Filter Row */}
          <motion.div
            className="flex gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex-1">
              <TeamSearchBar 
                value={searchQuery} 
                onChange={setSearchQuery}
              />
            </div>
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

          {/* Team View Segmented Control */}
          <motion.div
            className="flex items-center gap-1 bg-muted p-1 rounded-lg w-full sm:w-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              variant={showAllTeams ? "ghost" : "default"}
              size="sm"
              onClick={() => setShowAllTeams(false)}
              className="flex-1 sm:flex-initial min-h-11"
            >
              My Teams ({myTeams.length})
            </Button>
            <Button
              variant={showAllTeams ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowAllTeams(true)}
              className="flex-1 sm:flex-initial min-h-11"
            >
              All Teams ({publicTeams.length})
            </Button>
          </motion.div>


          {/* My Teams Section - 2 Column Grid */}
          {!showAllTeams && (
            <motion.div 
              className="space-y-3 sm:space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-body-large font-semibold">
                My Teams ({filteredMyTeams.length})
              </h2>

              {/* Create Team CTA Card */}
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all border-dashed border-2 bg-muted/30 hover:bg-muted/50"
                onClick={() => navigate("/teams/create")}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plus className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">Create a New Team</h3>
                    <p className="text-sm text-muted-foreground">Start building your sports community</p>
                  </div>
                </CardContent>
              </Card>

              {filteredMyTeams.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {filteredMyTeams.map((team, index) => (
                  <AnimatedCard key={team.id} delay={0.35 + index * 0.05} hover={false}>
                    <TeamCard
                      team={team}
                      memberCount={memberCounts[team.id] || 0}
                      isMember={true}
                    />
                  </AnimatedCard>
                ))}
              </div>
              )}
            </motion.div>
          )}

          {/* Empty State for My Teams */}
          {!showAllTeams && filteredMyTeams.length === 0 && (
            <EmptyState
              icon={Users}
              title="No teams yet"
              description="Create your first team to get started"
              action={
                <Button onClick={() => navigate("/teams/create")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Team
                </Button>
              }
            />
          )}

          {/* All Teams Section */}
          {showAllTeams && (
            <motion.div 
              className="space-y-3 sm:space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-body-large font-semibold">
                {searchQuery ? `Search Results (${filteredPublicTeams.length})` : "Teams"}
              </h2>
            
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {[...Array(6)].map((_, i) => (
                  <TeamCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredPublicTeams.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {filteredPublicTeams.map((team, index) => (
                  <AnimatedCard key={team.id} delay={0.45 + index * 0.05} hover={false}>
                    <TeamCard
                      team={team}
                      memberCount={memberCounts[team.id] || 0}
                      isMember={false}
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
          )}
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
