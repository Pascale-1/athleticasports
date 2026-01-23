import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, Upload, Share2 } from "lucide-react";
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

      // Valider le type MIME
      if (!file.type.startsWith('image/')) {
        toast.error("Only image files are allowed");
        return;
      }

      // Limiter la taille (5MB)
      const MAX_FILE_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File is too large (max 5MB)");
        return;
      }

      // Verifier l'extension
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
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <PageHeader
          title={t("profile.title")}
          showBackButton
          backPath="/"
          rightAction={<LogoutButton variant="header" />}
        />

        {/* Hero Section */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex flex-col items-center text-center space-y-3">
            {/* Avatar */}
            <div className="relative group">
              <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                <AvatarImage src={profile.avatar_url || ""} />
                <AvatarFallback className="text-2xl">
                  {profile.display_name?.[0] || profile.username[0]}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {uploading ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Upload className="h-6 w-6 text-white" />
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

            {/* Name and Username */}
            <div className="space-y-1">
              <h1 className="text-lg font-bold">
                {profile.display_name || profile.username}
              </h1>
              <p className="text-muted-foreground">@{profile.username}</p>
              {profile.is_founding_member && (
                <FoundingMemberBadge size="sm" />
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-sm text-muted-foreground max-w-md">
                {profile.bio}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Profile
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <ProfileStats userId={profile.user_id} />
        </div>

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
