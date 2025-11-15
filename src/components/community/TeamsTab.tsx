import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Team } from "@/lib/teams";
import { TeamCard } from "@/components/teams/TeamCard";
import { TeamCarousel } from "@/components/teams/TeamCarousel";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TeamsTabProps {
  myTeams: Team[];
  publicTeams: Team[];
  memberCounts: Record<string, number>;
  activeSport: string;
  onTeamsUpdate: () => void;
}

export const TeamsTab = ({ 
  myTeams, 
  publicTeams, 
  memberCounts, 
  activeSport,
  onTeamsUpdate 
}: TeamsTabProps) => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);

  useState(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
  });

  const filteredMyTeams = myTeams.filter(team => 
    activeSport === "All" || team.sport === activeSport
  );

  const filteredPublicTeams = publicTeams
    .filter(team => !myTeams.some(mt => mt.id === team.id))
    .filter(team => activeSport === "All" || team.sport === activeSport);

  const handleLeaveTeam = async (teamId: string) => {
    if (!userId) return;
    try {
      await supabase
        .from("team_members")
        .delete()
        .eq("team_id", teamId)
        .eq("user_id", userId);
      
      toast.success("Left team successfully");
      onTeamsUpdate();
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

  const featuredTeams = filteredPublicTeams.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Featured Teams Carousel */}
      {featuredTeams.length > 0 && (
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
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
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg sm:text-xl font-semibold">
            My Teams ({filteredMyTeams.length})
          </h2>
          <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
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
        </motion.div>
      )}

      {/* Public Teams Section */}
      <motion.div 
        className="space-y-3 sm:space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg sm:text-xl font-semibold">
          Discover Teams {activeSport !== "All" && `(${activeSport})`}
        </h2>
        
        {filteredPublicTeams.length > 0 ? (
          <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
            {filteredPublicTeams.map((team, index) => (
              <AnimatedCard key={team.id} delay={0.35 + index * 0.05} hover={false}>
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
            icon={Users}
            title={activeSport !== "All" ? `No ${activeSport} teams yet` : "No public teams available"}
            description={activeSport !== "All" ? "Be the first to create one!" : "Create the first team for your community"}
            action={
              <Button onClick={() => navigate("/teams/create")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            }
          />
        )}
      </motion.div>
    </div>
  );
};
