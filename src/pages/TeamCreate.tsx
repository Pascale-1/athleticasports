import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createTeam } from "@/lib/teams";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { SportQuickSelector } from "@/components/events/SportQuickSelector";

const TeamCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, i18n } = useTranslation('teams');
  const lang = (i18n.language?.split('-')[0] || 'en') as 'en' | 'fr';
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_private: false,
    sport: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      if (!formData.name || formData.name.trim().length < 2) {
        throw new Error(t('form.nameMinLength'));
      }

      if (formData.name.length > 100) {
        throw new Error(t('form.nameMaxLength'));
      }

      if (!formData.sport) {
        throw new Error(t('form.sportRequired'));
      }

      const team = await createTeam({
        name: formData.name,
        description: formData.description,
        is_private: formData.is_private,
        sport: formData.sport,
      });
      toast({
        title: "Success",
        description: "Team created successfully",
      });
      navigate(`/teams/${team.id}`);
    } catch (error: any) {
      console.error("Error creating team:", error);
      const errorMessage = error?.message || error?.error?.message || "Failed to create team. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/teams")}
        className="mb-4 sm:mb-6 min-h-11"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        <span className="text-xs sm:text-sm">Back to Teams</span>
      </Button>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl">{t('create.title')}</CardTitle>
          <CardDescription className="text-sm">
            {t('create.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t('form.name')} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('form.namePlaceholder')}
                required
                minLength={2}
                maxLength={100}
              />
            </div>

            <SportQuickSelector
              value={formData.sport || null}
              onChange={(sport) => setFormData({ ...formData, sport: sport || "" })}
              label={t('form.sport')}
              lang={lang}
              required
            />

            <div className="space-y-2">
              <Label htmlFor="description">{t('form.description')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('form.descriptionPlaceholder')}
                rows={4}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="private">{t('form.privateTeam')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('form.privateTeamDesc')}
                </p>
              </div>
              <Switch
                id="private"
                checked={formData.is_private}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_private: checked })
                }
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/teams")}
                className="flex-1"
              >
                {t('actions.cancel', { ns: 'common' })}
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? t('actions.loading', { ns: 'common' }) : t('create.submit')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamCreate;
