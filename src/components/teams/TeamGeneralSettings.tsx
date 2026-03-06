import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Team, updateTeam } from "@/lib/teams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    announcement_permission: (team as any).announcement_permission || "admin",
    chat_permission: (team as any).chat_permission || "member",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateTeam(team.id, {
        name: formData.name,
        description: formData.description || null,
        is_private: formData.is_private,
        announcement_permission: formData.announcement_permission,
        chat_permission: formData.chat_permission,
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

        {/* Permissions */}
        <div className="space-y-3 rounded-lg border p-4">
          <h3 className="text-sm font-semibold">{t('settingsPage.permissions', 'Permissions')}</h3>
          
          <div className="space-y-2">
            <Label>{t('settingsPage.whoCanAnnounce', 'Who can post announcements')}</Label>
            <Select
              value={formData.announcement_permission}
              onValueChange={(v) => setFormData({ ...formData, announcement_permission: v })}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">{t('settingsPage.adminsOnly', 'Admins & Coaches only')}</SelectItem>
                <SelectItem value="member">{t('settingsPage.allMembers', 'All members')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>{t('settingsPage.whoCanChat', 'Who can post in chat')}</Label>
            <Select
              value={formData.chat_permission}
              onValueChange={(v) => setFormData({ ...formData, chat_permission: v })}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">{t('settingsPage.adminsOnly', 'Admins & Coaches only')}</SelectItem>
                <SelectItem value="member">{t('settingsPage.allMembers', 'All members')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto h-11">
          {isLoading ? t('settingsPage.saving') : t('settingsPage.saveChanges')}
        </Button>
      </div>
    </form>
  );
};
