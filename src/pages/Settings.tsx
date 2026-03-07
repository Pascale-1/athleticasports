import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, Upload, Share2, Camera } from "lucide-react";
import { ProfileStats } from "@/components/settings/ProfileStats";
import { getDisplayUsername } from "@/lib/usernameUtils";
import { ProfileTabs } from "@/components/settings/ProfileTabs";
import { PageContainer } from "@/components/mobile/PageContainer";
import { PageHeader } from "@/components/mobile/PageHeader";
import { FoundingMemberBadge } from "@/components/profile/FoundingMemberBadge";
import { AccountDangerZone } from "@/components/settings/AccountDangerZone";
import { getAppBaseUrl } from "@/lib/appUrl";
import { copyToClipboard } from "@/lib/clipboard";
import { LogoutButton } from "@/components/settings/LogoutButton";
import { useAppWalkthrough } from "@/hooks/useAppWalkthrough";

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  full_name: string | null;
  primary_sport: string | null;
  team_name: string | null;
  created_at: string;
  is_founding_member?: boolean | null;
}

const Settings = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [email, setEmail] = useState("");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<any>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  // Walkthrough
  const { startWalkthrough, hasCompleted } = useAppWalkthrough();

  useEffect(() => {
    if (!loading && profile && !hasCompleted('profile')) {
      startWalkthrough('profile');
    }
  }, [loading, profile, startWalkthrough, hasCompleted]);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email || "");

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(t("profileToasts.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveField = async () => {
    if (!profile || !editingField) return;

    try {
      const updateData: any = {};
      
      if (editingField === 'fullName') updateData.full_name = tempValues.fullName || null;
      if (editingField === 'displayName') updateData.display_name = tempValues.displayName || null;
      if (editingField === 'primarySport') updateData.primary_sport = tempValues.primarySport || null;
      if (editingField === 'teamName') updateData.team_name = tempValues.teamName || null;
      if (editingField === 'bio') updateData.bio = tempValues.bio || null;

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', profile.user_id);

      if (error) throw error;
      
      toast.success(t("profileToasts.updated"));
      setEditingField(null);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t("profileToasts.updateError"));
    }
  };

  const handleSaveAllFields = async (values: Record<string, string>) => {
    if (!profile) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: values.fullName || null,
          display_name: values.displayName || null,
          primary_sport: values.primarySport || null,
          team_name: values.teamName || null,
          bio: values.bio || null,
        })
        .eq('user_id', profile.user_id);

      if (error) throw error;
      toast.success(t("profileToasts.updated"));
      setEditingField(null);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t("profileToasts.updateError"));
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop()?.toLowerCase();

      if (!file.type.startsWith('image/')) {
        toast.error(t("profileToasts.imageOnly"));
        return;
      }

      const MAX_FILE_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        toast.error(t("profileToasts.fileTooLarge"));
        return;
      }

      const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
      if (!fileExt || !allowedExtensions.includes(fileExt)) {
        toast.error(t("profileToasts.invalidType"));
        return;
      }

      // Upload inside a folder named after the user ID to match storage RLS policy
      const filePath = `${profile?.user_id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', profile?.user_id);

      if (updateError) throw updateError;

      toast.success(t("profileToasts.avatarUpdated"));
      fetchProfile();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error(t("profileToasts.avatarError"));
    } finally {
      setUploading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${getAppBaseUrl()}/users?user=${profile?.user_id}`;
    const shareData = {
      title: profile?.display_name || profile?.username,
      text: 'Athletica',
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
    } catch (error) {
      if ((error as DOMException)?.name === 'AbortError') return;
    }
    const copied = await copyToClipboard(shareUrl);
    if (copied) toast.success(t("profileToasts.linkCopied"));
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  if (!profile) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{t("errors.profileNotFound")}</p>
          <Button onClick={() => navigate("/")}>{t("actions.goHome")}</Button>
        </div>
      </PageContainer>
    );
  }

  const stats = {
    totalActivities: 0,
    totalDistance: 0,
    totalDuration: 0,
  };

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto space-y-6">
        <PageHeader
          title={t("profile.title")}
          showBackButton
          backPath="/"
          rightAction={<LogoutButton variant="header" />}
        />

        <Card className="p-4" data-walkthrough="profile-header">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <Avatar className="h-20 w-20 ring-2 ring-primary ring-offset-2 ring-offset-background">
                <AvatarImage src={profile.avatar_url || ""} />
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                  {profile.display_name?.[0] || profile.username[0]}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute -bottom-1 -right-1 p-1.5 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-md"
              >
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="h-3.5 w-3.5" />
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploading}
              />
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <h1 className="text-lg font-bold break-words">
                {profile.display_name || profile.username}
              </h1>
              <p className="text-sm text-muted-foreground">
                {getDisplayUsername(profile.username, profile.display_name, profile.full_name)}
              </p>
              {profile.is_founding_member && (
                <FoundingMemberBadge size="sm" />
              )}
              {profile.bio && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          <div data-walkthrough="profile-share" className="mt-4">
            <Button variant="outline" size="sm" onClick={handleShare} className="w-full h-9">
              <Share2 className="h-4 w-4 mr-2" />
              {t('profile.shareProfile')}
            </Button>
          </div>

          <div data-walkthrough="profile-stats">
            <ProfileStats userId={profile.user_id} />
          </div>
        </Card>

        <div data-walkthrough="profile-tabs">
          <ProfileTabs
            profile={profile}
            email={email}
            stats={stats}
            onEditField={handleSaveField}
            onSaveField={handleSaveField}
            onSaveAllFields={handleSaveAllFields}
            editingField={editingField}
            setEditingField={setEditingField}
            tempValues={tempValues}
            setTempValues={setTempValues}
          />
        </div>

        <AccountDangerZone />
      </div>
    </PageContainer>
  );
};

export default Settings;
