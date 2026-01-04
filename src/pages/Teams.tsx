import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Users, Search as SearchIcon } from "lucide-react";
import { Team } from "@/lib/teams";
import { PageContainer } from "@/components/mobile/PageContainer";
import { PageHeader } from "@/components/mobile/PageHeader";
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getActiveSports, getFeaturedSports, getRegularSports } from "@/lib/sports";
import { OnboardingHint } from "@/components/onboarding/OnboardingHint";

const Teams = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation('teams');
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
    
    const teamsChannel = supabase
      .channel('teams-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () => fetchTeams())
      .subscribe();
      
    const membersChannel = supabase
      .channel('team-members-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, () => fetchTeams())
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

  if (loading) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PullToRefresh onRefresh={handleRefresh}>
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <PageHeader
            title={t('title')}
            subtitle={`${myTeams.length} ${myTeams.length !== 1 ? t('memberPlural') : t('member')} • ${publicTeams.length} ${t('common:status.active').toLowerCase()}`}
            rightAction={
              <Button onClick={() => navigate("/teams/create")} className="gap-2">
                <Plus className="h-4 w-4" />
                {t('createTeam')}
              </Button>
            }
          />

          {/* Teams Onboarding Hint - show only when user has no teams */}
          {myTeams.length === 0 && (
            <OnboardingHint
              id="hint-teams"
              icon={Users}
              titleKey="common:onboarding.teams.title"
              descriptionKey="common:onboarding.teams.description"
              variant="info"
              action={{
                labelKey: "common:onboarding.showMe",
                onClick: () => navigate("/teams/create"),
              }}
            />
          )}

          {/* Search & Filter */}
          <motion.div
            className="flex gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex-1">
              <TeamSearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
            <FilterSheet 
              activeCount={activeSport !== "All" ? 1 : 0}
              onApply={() => {}}
              onReset={() => setActiveSport("All")}
            >
                <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-3 block">{t('filters.sport')}</Label>
                  <Select value={activeSport} onValueChange={setActiveSport}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('form.sportPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">{i18n.language?.startsWith('fr') ? 'Tous' : 'All'}</SelectItem>
                      <SelectGroup>
                        <SelectLabel>{i18n.language?.startsWith('fr') ? '⭐ Populaires' : '⭐ Popular'}</SelectLabel>
                        {getFeaturedSports().map((sport) => (
                          <SelectItem key={sport.id} value={sport.id}>
                            {sport.emoji} {sport.label[i18n.language?.startsWith('fr') ? 'fr' : 'en']}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>{i18n.language?.startsWith('fr') ? 'Autres' : 'Others'}</SelectLabel>
                        {getRegularSports().map((sport) => (
                          <SelectItem key={sport.id} value={sport.id}>
                            {sport.emoji} {sport.label[i18n.language?.startsWith('fr') ? 'fr' : 'en']}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </FilterSheet>
          </motion.div>

          {/* View Toggle */}
          <motion.div
            className="flex items-center gap-1 bg-muted p-1 rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Button
              variant={showAllTeams ? "ghost" : "default"}
              size="sm"
              onClick={() => setShowAllTeams(false)}
              className="flex-1 h-10"
            >
              {t('myTeams')} ({myTeams.length})
            </Button>
            <Button
              variant={showAllTeams ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowAllTeams(true)}
              className="flex-1 h-10"
            >
              {t('filters.all')} ({publicTeams.length})
            </Button>
          </motion.div>

          {/* My Teams Section */}
          {!showAllTeams && (
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-h3 font-heading font-semibold">
                {t('myTeams')} ({filteredMyTeams.length})
              </h2>

              {filteredMyTeams.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {filteredMyTeams.map((team, index) => (
                    <AnimatedCard key={team.id} delay={0.25 + index * 0.05} hover={false}>
                      <TeamCard
                        team={team}
                        memberCount={memberCounts[team.id] || 0}
                        isMember={true}
                      />
                    </AnimatedCard>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Users}
                  title={t('noTeams')}
                  description={t('noTeamsDesc')}
                  action={
                    <Button onClick={() => navigate("/teams/create")}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('createTeam')}
                    </Button>
                  }
                />
              )}
            </motion.div>
          )}

          {/* All Teams Section */}
          {showAllTeams && (
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-h3 font-heading font-semibold">
                {searchQuery ? `${t('common:actions.search')} (${filteredPublicTeams.length})` : t('filters.all')}
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
                    <AnimatedCard key={team.id} delay={0.25 + index * 0.05} hover={false}>
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
                  title={searchQuery ? t('common:empty.title') : activeSport !== "All" ? `${t('noTeams')} - ${activeSport}` : t('noTeams')}
                  description={searchQuery ? t('common:empty.description') : t('noTeamsDesc')}
                  action={
                    searchQuery ? (
                      <Button onClick={() => setSearchQuery("")} variant="outline">
                        {t('filters.clearFilters')}
                      </Button>
                    ) : (
                      <Button onClick={() => navigate("/teams/create")}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t('createTeam')}
                      </Button>
                    )
                  }
                />
              )}
            </motion.div>
          )}
        </motion.div>
      </PullToRefresh>

      {/* FAB */}
      <FAB
        icon={<Plus className="h-5 w-5" />}
        label={t('createTeam')}
        onClick={() => navigate("/teams/create")}
      />
    </PageContainer>
  );
};

export default Teams;