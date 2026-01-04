import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, User, Mail, Calendar, Swords, Globe, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SportSelector } from "./SportSelector";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { useNavigate } from "react-router-dom";
import { formatMonthYear } from "@/lib/dateUtils";

interface ProfileTabsProps {
  profile: any;
  email: string;
  stats: {
    totalActivities: number;
    totalDistance: number;
    totalDuration: number;
  };
  onEditField: (field: string, value: string) => void;
  onSaveField: () => void;
  editingField: string | null;
  setEditingField: (field: string | null) => void;
  tempValues: any;
  setTempValues: (values: any) => void;
}

export const ProfileTabs = ({
  profile,
  email,
  stats,
  onEditField,
  onSaveField,
  editingField,
  setEditingField,
  tempValues,
  setTempValues,
}: ProfileTabsProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">{t('profile.title')}</TabsTrigger>
        <TabsTrigger value="about">{t('profile.about')}</TabsTrigger>
        <TabsTrigger value="settings">{t('profile.settings')}</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-lg">{t('profile.title')}</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{t('profile.email')}:</span>
                <span className="text-sm">{email}</span>
              </div>

              {profile?.primary_sport && (
                <div className="flex items-center gap-3">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{t('profile.sport')}:</span>
                  <Badge variant="secondary">{profile.primary_sport}</Badge>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{t('time.ago')}:</span>
                <span className="text-sm">
                  {formatMonthYear(profile?.created_at)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-lg">{t('actions.search')}</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => navigate("/events?type=match")}
              >
                <Swords className="h-5 w-5 text-primary" />
                <span className="text-xs">{t('home.findMatch')}</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => navigate("/teams")}
              >
                <Users className="h-5 w-5 text-primary" />
                <span className="text-xs">{t('nav.teams')}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="about" className="space-y-4">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>{t('profile.fullName')}</Label>
              {editingField === 'fullName' ? (
                <div className="flex gap-2">
                  <Input
                    value={tempValues.fullName}
                    onChange={(e) => setTempValues({ ...tempValues, fullName: e.target.value })}
                  />
                  <Button onClick={onSaveField} size="sm">{t('actions.save')}</Button>
                  <Button onClick={() => setEditingField(null)} size="sm" variant="outline">{t('actions.cancel')}</Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm">{profile?.full_name || t('empty.description')}</p>
                  <Button
                    onClick={() => {
                      setEditingField('fullName');
                      setTempValues({ ...tempValues, fullName: profile?.full_name || '' });
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    {t('actions.edit')}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('profile.displayName')}</Label>
              {editingField === 'displayName' ? (
                <div className="flex gap-2">
                  <Input
                    value={tempValues.displayName}
                    onChange={(e) => setTempValues({ ...tempValues, displayName: e.target.value })}
                  />
                  <Button onClick={onSaveField} size="sm">{t('actions.save')}</Button>
                  <Button onClick={() => setEditingField(null)} size="sm" variant="outline">{t('actions.cancel')}</Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm">{profile?.display_name || t('empty.description')}</p>
                  <Button
                    onClick={() => {
                      setEditingField('displayName');
                      setTempValues({ ...tempValues, displayName: profile?.display_name || '' });
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    {t('actions.edit')}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('profile.sport')}</Label>
              {editingField === 'primarySport' ? (
                <div className="space-y-2">
                  <SportSelector
                    value={tempValues.primarySport}
                    onChange={(value) => setTempValues({ ...tempValues, primarySport: value })}
                  />
                  <div className="flex gap-2">
                    <Button onClick={onSaveField} size="sm">{t('actions.save')}</Button>
                    <Button onClick={() => setEditingField(null)} size="sm" variant="outline">{t('actions.cancel')}</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm">{profile?.primary_sport || t('empty.description')}</p>
                  <Button
                    onClick={() => {
                      setEditingField('primarySport');
                      setTempValues({ ...tempValues, primarySport: profile?.primary_sport || '' });
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    {t('actions.edit')}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('profile.team')}</Label>
              {editingField === 'teamName' ? (
                <div className="flex gap-2">
                  <Input
                    value={tempValues.teamName}
                    onChange={(e) => setTempValues({ ...tempValues, teamName: e.target.value })}
                  />
                  <Button onClick={onSaveField} size="sm">{t('actions.save')}</Button>
                  <Button onClick={() => setEditingField(null)} size="sm" variant="outline">{t('actions.cancel')}</Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm">{profile?.team_name || t('empty.description')}</p>
                  <Button
                    onClick={() => {
                      setEditingField('teamName');
                      setTempValues({ ...tempValues, teamName: profile?.team_name || '' });
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    {t('actions.edit')}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('profile.bio')}</Label>
              {editingField === 'bio' ? (
                <div className="space-y-2">
                  <Textarea
                    value={tempValues.bio}
                    onChange={(e) => setTempValues({ ...tempValues, bio: e.target.value })}
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button onClick={onSaveField} size="sm">{t('actions.save')}</Button>
                    <Button onClick={() => setEditingField(null)} size="sm" variant="outline">{t('actions.cancel')}</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm">{profile?.bio || t('empty.description')}</p>
                  <Button
                    onClick={() => {
                      setEditingField('bio');
                      setTempValues({ ...tempValues, bio: profile?.bio || '' });
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    {t('actions.edit')}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="settings" className="space-y-4">
        {/* Feedback Section */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">{t('feedback.title')}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('feedback.subtitle')}
            </p>
            <Button onClick={() => setFeedbackOpen(true)} className="w-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              {t('feedback.title')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {t('profile.language')}
              </Label>
              <LanguageSwitcher />
            </div>
          </CardContent>
        </Card>

        <FeedbackForm open={feedbackOpen} onOpenChange={setFeedbackOpen} />
      </TabsContent>
    </Tabs>
  );
};
