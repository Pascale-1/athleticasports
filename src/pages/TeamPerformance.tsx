import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { PageContainer } from "@/components/mobile/PageContainer";
import { PerformanceLevelsTab } from "@/components/teams/PerformanceLevelsTab";
import { useTeam } from "@/hooks/useTeam";
import { useTeamMembers } from "@/hooks/useTeamMembers";

const TeamPerformance = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { team, canManage } = useTeam(teamId || null);
  const { members, loading: membersLoading } = useTeamMembers(teamId || null);

  if (membersLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/teams/${teamId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-heading-2 font-bold">Performance Levels</h1>
            <p className="text-caption text-muted-foreground">{team?.name}</p>
          </div>
        </div>

        <PerformanceLevelsTab 
          teamId={teamId || ""} 
          members={members}
          canManage={canManage}
        />
      </div>
    </PageContainer>
  );
};

export default TeamPerformance;
