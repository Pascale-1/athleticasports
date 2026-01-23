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
import { ProfileTabs } from "@/components/settings/ProfileTabs";
import { PageContainer } from "@/components/mobile/PageContainer";
import { PageHeader } from "@/components/mobile/PageHeader";
import { FoundingMemberBadge } from "@/components/profile/FoundingMemberBadge";
import { LogoutButton } from "@/components/settings/LogoutButton";
import { AccountDangerZone } from "@/components/settings/AccountDangerZone";

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
      toast.error("Failed to load profile");
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
      
      toast.success("Profile updated");
      setEditingField(null);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile");
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
        toast.error("Only image files are allowed");
        return;
      }

      const MAX_FILE_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File is too large (max 5MB)");
        return;
      }

      const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
      if (!fileExt || !allowedExtensions.includes(fileExt)) {
        toast.error("Invalid file type. Allowed: jpg, jpeg, png, webp, gif");
        return;
      }

      const filePath = `${profile?.user_id}-${Math.random()}.${fileExt}`;

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

      toast.success("Avatar updated successfully");
      fetchProfile();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${profile?.display_name || profile?.username}'s Profile`,
      text: `Check out my profile on Sports Collective!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Profile link copied to clipboard");
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
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
          <p className="text-muted-foreground mb-4">Profile not found</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
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
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <PageHeader
          title={t("profile.title")}
          showBackButton
          backPath="/"
          rightAction={<LogoutButton variant="header" />}
        />

        {/* Hero Section - Left-aligned on mobile */}
        <Card className="p-4">
          <div className="flex items-start gap-4">
            {/* Avatar with persistent camera icon */}
            <div className="relative shrink-0">
              <Avatar className="h-20 w-20 border-2 border-primary/20">
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

            {/* Name and Info */}
            <div className="flex-1 min-w-0 space-y-1">
              <h1 className="text-lg font-bold truncate">
                {profile.display_name || profile.username}
              </h1>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
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

          {/* Action Button */}
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={handleShare} className="w-full h-9">
              <Share2 className="h-4 w-4 mr-2" />
              {t('profile.shareProfile')}
            </Button>
          </div>

          {/* Stats Row */}
          <ProfileStats userId={profile.user_id} />
        </Card>

        {/* Tabbed Content */}
        <ProfileTabs
          profile={profile}
          email={email}
          stats={stats}
          onEditField={handleSaveField}
          onSaveField={handleSaveField}
          editingField={editingField}
          setEditingField={setEditingField}
          tempValues={tempValues}
          setTempValues={setTempValues}
        />

        {/* Account Danger Zone */}
        <AccountDangerZone />
      </div>
    </PageContainer>
  );
};

export default Settings;
