import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Team, updateTeam } from "@/lib/teams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface TeamGeneralSettingsProps {
  team: Team;
}

export const TeamGeneralSettings = ({ team }: TeamGeneralSettingsProps) => {
  const { t } = useTranslation('teams');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: team.name,
    description: team.description || "",
    is_private: team.is_private,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateTeam(team.id, {
        name: formData.name,
        description: formData.description || null,
        is_private: formData.is_private,
      });

      toast({
        title: t('settingsPage.updateSuccess'),
        description: t('settingsPage.updateSuccess'),
      });
    } catch (error) {
      console.error("Error updating team:", error);
      toast({
        title: t('settingsPage.updateError'),
        description: t('settingsPage.updateError'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-4 sm:p-6">
      <h2 className="text-lg font-semibold mb-4">{t('settingsPage.general')}</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t('settingsPage.teamName')}</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{t('settingsPage.description')}</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="privacy">{t('settingsPage.privateTeam')}</Label>
            <p className="text-sm text-muted-foreground">
              {formData.is_private
                ? t('settingsPage.privateDesc')
                : t('settingsPage.publicDesc')}
            </p>
          </div>
          <Switch
            id="privacy"
            checked={formData.is_private}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, is_private: checked })
            }
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto h-11">
          {isLoading ? t('settingsPage.saving') : t('settingsPage.saveChanges')}
        </Button>
      </div>
    </form>
  );
};
