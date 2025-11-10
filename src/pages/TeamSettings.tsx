import { useParams, useNavigate } from "react-router-dom";
import { useTeam } from "@/hooks/useTeam";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TeamGeneralSettings } from "@/components/teams/TeamGeneralSettings";
import { TeamDangerZone } from "@/components/teams/TeamDangerZone";

const TeamSettings = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { team, userRole, isLoading, canManage } = useTeam(teamId || null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!team || !canManage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">
          You don't have permission to manage this team's settings.
        </p>
        <Button onClick={() => navigate("/teams")}>Back to Teams</Button>
      </div>
    );
  }

  const isOwner = userRole === "owner";

  return (
    <div className="container max-w-4xl py-8">
      <Button
        variant="ghost"
        onClick={() => navigate(`/teams/${teamId}`)}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Team
      </Button>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Team Settings</h1>
          <p className="text-muted-foreground">
            Manage your team's information and settings
          </p>
        </div>

        <TeamGeneralSettings team={team} />

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Team Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Team ID:</span>
              <span className="font-mono text-xs">{team.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created:</span>
              <span>{new Date(team.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated:</span>
              <span>{new Date(team.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {isOwner && <TeamDangerZone team={team} />}
      </div>
    </div>
  );
};

export default TeamSettings;
