import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, User, Mail, Calendar, Globe, MessageSquare, PlayCircle, Pencil, Settings, Activity, KeyRound } from "lucide-react";
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
import { useAppWalkthrough } from "@/hooks/useAppWalkthrough";
import { ProfileActivityTab } from "./ProfileActivityTab";
import { ChangePasswordSection } from "./ChangePasswordSection";
import { ProfileCompletionCard } from "./ProfileCompletionCard";
import { NextEventCard } from "./NextEventCard";

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
  const [isEditMode, setIsEditMode] = useState(false);
  const { resetWalkthrough, startWalkthrough } = useAppWalkthrough();

  const handleRestartWalkthrough = () => {
    resetWalkthrough();
    navigate('/');
    setTimeout(() => startWalkthrough(), 500);
  };

  const handleEnterEditMode = () => {
    setIsEditMode(true);
    setTempValues({
      fullName: profile?.full_name || '',
      displayName: profile?.display_name || '',
      primarySport: profile?.primary_sport || '',
      teamName: profile?.team_name || '',
      bio: profile?.bio || '',
    });
  };

  const handleSaveAll = () => {
    // Save all fields in sequence
    ['fullName', 'displayName', 'primarySport', 'teamName', 'bio'].forEach(field => {
      setEditingField(field);
    });
    onSaveField();
    setIsEditMode(false);
    setEditingField(null);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditingField(null);
  };

    const [activeTab, setActiveTab] = useState("overview");

    const switchToAbout = () => setActiveTab("about");

    return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview" className="flex items-center gap-1.5 text-xs">
          <User className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline truncate">{t('profile.title')}</span>
        </TabsTrigger>
        <TabsTrigger value="activity" className="flex items-center gap-1.5 text-xs">
          <Activity className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline truncate">{t('profile.activity')}</span>
        </TabsTrigger>
        <TabsTrigger value="about" className="flex items-center gap-1.5 text-xs">
          <Pencil className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline truncate">{t('profile.about')}</span>
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-1.5 text-xs">
          <Settings className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline truncate">{t('profile.settings')}</span>
        </TabsTrigger>
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

        {/* Profile Completion */}
        <ProfileCompletionCard profile={profile} onGoToAbout={switchToAbout} />

        {/* Next Event */}
        <NextEventCard />
      </TabsContent>

      <TabsContent value="activity" className="space-y-4">
        <ProfileActivityTab userId={profile?.user_id} />
      </TabsContent>

      <TabsContent value="about" className="space-y-4">
        <Card>
          <CardContent className="pt-6 space-y-4">
            {/* Edit Mode Toggle */}
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{t('profile.about')}</h3>
              {isEditMode ? (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                    {t('actions.cancel')}
                  </Button>
                  <Button size="sm" onClick={handleSaveAll}>
                    {t('actions.saveAll')}
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="ghost" onClick={handleEnterEditMode}>
                  <Pencil className="h-4 w-4 mr-1" />
                  {t('actions.edit')}
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('profile.fullName')}</Label>
                {isEditMode ? (
                  <Input
                    value={tempValues.fullName}
                    onChange={(e) => setTempValues({ ...tempValues, fullName: e.target.value })}
                    placeholder={t('profile.fullName')}
                  />
                ) : (
                  <p className="text-sm py-2 px-3 bg-muted/50 rounded-md min-h-[40px] flex items-center">
                    {profile?.full_name || <span className="text-muted-foreground">{t('empty.description')}</span>}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t('profile.displayName')}</Label>
                {isEditMode ? (
                  <Input
                    value={tempValues.displayName}
                    onChange={(e) => setTempValues({ ...tempValues, displayName: e.target.value })}
                    placeholder={t('profile.displayName')}
                  />
                ) : (
                  <p className="text-sm py-2 px-3 bg-muted/50 rounded-md min-h-[40px] flex items-center">
                    {profile?.display_name || <span className="text-muted-foreground">{t('empty.description')}</span>}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t('profile.sport')}</Label>
                {isEditMode ? (
                  <SportSelector
                    value={tempValues.primarySport}
                    onChange={(value) => setTempValues({ ...tempValues, primarySport: value })}
                  />
                ) : (
                  <p className="text-sm py-2 px-3 bg-muted/50 rounded-md min-h-[40px] flex items-center">
                    {profile?.primary_sport ? (
                      <Badge variant="secondary">{profile.primary_sport}</Badge>
                    ) : (
                      <span className="text-muted-foreground">{t('empty.description')}</span>
                    )}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t('profile.team')}</Label>
                {isEditMode ? (
                  <Input
                    value={tempValues.teamName}
                    onChange={(e) => setTempValues({ ...tempValues, teamName: e.target.value })}
                    placeholder={t('profile.team')}
                  />
                ) : (
                  <p className="text-sm py-2 px-3 bg-muted/50 rounded-md min-h-[40px] flex items-center">
                    {profile?.team_name || <span className="text-muted-foreground">{t('empty.description')}</span>}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t('profile.bio')}</Label>
                {isEditMode ? (
                  <Textarea
                    value={tempValues.bio}
                    onChange={(e) => setTempValues({ ...tempValues, bio: e.target.value })}
                    rows={4}
                    placeholder={t('profile.bio')}
                  />
                ) : (
                  <p className="text-sm py-2 px-3 bg-muted/50 rounded-md min-h-[80px]">
                    {profile?.bio || <span className="text-muted-foreground">{t('empty.description')}</span>}
                  </p>
                )}
              </div>
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

        {/* Walkthrough Section */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <PlayCircle className="h-4 w-4" />
                {t('settings.walkthrough')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.walkthroughDescription')}
              </p>
              <Button 
                variant="outline" 
                onClick={handleRestartWalkthrough}
                className="w-full"
              >
                {t('settings.restartWalkthrough')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Change Password Section */}
        <ChangePasswordSection email={email} />

        <FeedbackForm open={feedbackOpen} onOpenChange={setFeedbackOpen} />
      </TabsContent>
    </Tabs>
  );
};
