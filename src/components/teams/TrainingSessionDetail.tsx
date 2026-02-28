import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Users, Shuffle } from "lucide-react";
import { TrainingSession } from "@/hooks/useTrainingSessions";
import { useTeamGeneration } from "@/hooks/useTeamGeneration";
import { GenerateTeamsDialog } from "./GenerateTeamsDialog";
import { GeneratedTeamCard, accentColors } from "./GeneratedTeamCard";
import { SessionAttendance } from "./SessionAttendance";

interface TrainingSessionDetailProps {
  session: TrainingSession;
  canManage: boolean;
  totalMembers: number;
  currentUserId?: string;
}

export const TrainingSessionDetail = ({
  session,
  canManage,
  totalMembers,
  currentUserId,
}: TrainingSessionDetailProps) => {
  const { t } = useTranslation("common");
  const { teams, loading, generating, generateTeams, deleteTeams } = useTeamGeneration(session.id);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);

  const handleGenerate = async (numTeams: number) => {
    await generateTeams(numTeams);
  };

  const handleRegenerate = async () => {
    await deleteTeams();
    setShowGenerateDialog(true);
  };

  const isPastSession = new Date(session.end_time) < new Date();

  return (
    <div className="space-y-6">
      <SessionAttendance
        sessionId={session.id}
        totalMembers={totalMembers}
        canViewDetails={canManage}
        currentUserId={currentUserId}
        isPastSession={isPastSession}
      />

      <Card>
        <CardHeader>
          <CardTitle>{session.title}</CardTitle>
          {session.description && (
            <CardDescription>{session.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(session.start_time), "PPP")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(new Date(session.start_time), "p")} -{" "}
                {format(new Date(session.end_time), "p")}
              </span>
            </div>
            {session.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{session.location}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t("practiceTeams.title")}
              </CardTitle>
              <CardDescription>
                {teams.length > 0
                  ? t("practiceTeams.balanced", { count: teams.length })
                  : t("practiceTeams.none")}
              </CardDescription>
            </div>
            {canManage && (
              <div className="flex gap-2">
                {teams.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerate}
                    disabled={generating}
                  >
                    <Shuffle className="h-4 w-4 mr-2" />
                    {t("practiceTeams.regenerate")}
                  </Button>
                )}
                {teams.length === 0 && (
                  <Button
                    size="sm"
                    onClick={() => setShowGenerateDialog(true)}
                    disabled={generating}
                  >
                    <Shuffle className="h-4 w-4 mr-2" />
                    {t("practiceTeams.generateTeams")}
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">{t("practiceTeams.loadingTeams")}</p>
          ) : teams.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">{t("practiceTeams.noTeams")}</p>
              <p className="text-sm text-muted-foreground mb-4">
                {t("practiceTeams.noTeamsDesc")}
              </p>
              {canManage && (
                <Button onClick={() => setShowGenerateDialog(true)}>
                  <Shuffle className="h-4 w-4 mr-2" />
                  {t("practiceTeams.generateTeams")}
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team, idx) => (
                <GeneratedTeamCard
                  key={team.id}
                  team={team}
                  accentColor={accentColors[idx % accentColors.length]}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {canManage && (
        <GenerateTeamsDialog
          open={showGenerateDialog}
          onOpenChange={setShowGenerateDialog}
          onGenerate={handleGenerate}
          totalPlayers={totalMembers}
          generating={generating}
        />
      )}
    </div>
  );
};
