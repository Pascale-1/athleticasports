import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTeam } from "@/hooks/useTeam";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { TeamGeneralSettings } from "@/components/teams/TeamGeneralSettings";
import { TeamDangerZone } from "@/components/teams/TeamDangerZone";
import { PageContainer } from "@/components/mobile/PageContainer";
import { PageHeader } from "@/components/mobile/PageHeader";

const TeamSettings = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('teams');
  const { team, userRole, isLoading, canManage } = useTeam(teamId || null);

  if (isLoading) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </PageContainer>
    );
  }

  if (!team || !canManage) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <h1 className="text-2xl font-bold">{t('settingsPage.accessDenied')}</h1>
          <p className="text-muted-foreground text-center">
            {t('settingsPage.noPermission')}
          </p>
          <Button onClick={() => navigate("/teams")}>{t('settingsPage.backToTeams')}</Button>
        </div>
      </PageContainer>
    );
  }

  const isOwner = userRole === "owner";

  return (
    <PageContainer>
      <div className="space-y-6 animate-fade-in">
        {/* Header with Back Button */}
        <PageHeader
          title={t('settingsPage.title')}
          subtitle={t('settingsPage.subtitle')}
          showBackButton={true}
          backPath={`/teams/${teamId}`}
        />

        {/* Team Avatar & Name Summary */}
        <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
          <Avatar className="h-16 w-16">
            <AvatarImage src={team.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {team.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold truncate">{team.name}</h2>
            {team.sport && (
              <p className="text-sm text-muted-foreground">{team.sport}</p>
            )}
          </div>
        </div>

        {/* General Settings */}
        <TeamGeneralSettings team={team} />

        {/* Team Information */}
        <div className="rounded-lg border bg-card p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">{t('settingsPage.teamInfo')}</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t('settingsPage.teamId')}</span>
              <span className="font-mono text-xs truncate max-w-[150px] sm:max-w-none">{team.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('settingsPage.created')}</span>
              <span>{new Date(team.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('settingsPage.lastUpdated')}</span>
              <span>{new Date(team.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Danger Zone - Owner Only */}
        {isOwner && <TeamDangerZone team={team} />}
      </div>
    </PageContainer>
  );
};

export default TeamSettings;
