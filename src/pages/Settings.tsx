import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { SportSelector } from "@/components/settings/SportSelector";
import { ProfilePreview } from "@/components/settings/ProfilePreview";

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
}

const Settings = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [primarySport, setPrimarySport] = useState("");
  const [teamName, setTeamName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [originalValues, setOriginalValues] = useState({
    fullName: "",
    displayName: "",
    primarySport: "",
    teamName: "",
    bio: ""
  });

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
      if (data) {
        const values = {
          fullName: data.full_name || "",
          displayName: data.display_name || "",
          primarySport: data.primary_sport || "",
          teamName: data.team_name || "",
          bio: data.bio || ""
        };
        setFullName(values.fullName);
        setDisplayName(values.displayName);
        setPrimarySport(values.primarySport);
        setTeamName(values.teamName);
        setBio(values.bio);
        setOriginalValues(values);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      if (profile) {
        // Update existing profile
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: fullName || null,
            display_name: displayName || null,
            primary_sport: primarySport || null,
            team_name: teamName || null,
            bio: bio || null,
          })
          .eq('user_id', profile.user_id);

        if (error) throw error;
        toast.success("Profile updated successfully");
        setIsEditing(false);
        fetchProfile();
      } else {
        // Create new profile - generate random username
        const { data: username, error: usernameError } = await supabase
          .rpc('generate_random_username');

        if (usernameError) throw usernameError;

        const { error } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            username: username,
            full_name: fullName || null,
            display_name: displayName || null,
            primary_sport: primarySport || null,
            team_name: teamName || null,
            bio: bio || null,
          });

        if (error) throw error;
        toast.success("Profile created successfully");
        setIsEditing(false);
        fetchProfile();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(profile ? "Failed to update profile" : "Failed to create profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.user_id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', profile.user_id);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }


  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-in px-3 sm:px-0 pb-20">
      <div>
        <h1 className="text-heading-1 font-bold tracking-tight">Settings</h1>
        <p className="text-body text-muted-foreground">Manage your profile settings</p>
      </div>

      {/* Profile Preview Section */}
      {profile && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <Avatar size="2xl" ring="coral">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-heading-1 bg-primary/10 text-primary">
                    {profile.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <Label 
                  htmlFor="avatar" 
                  className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary-dark transition-all shadow-md"
                  aria-label="Upload avatar"
                >
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Upload className="h-5 w-5" />
                  )}
                </Label>
              </div>
              <div>
                <p className="text-heading-3 font-semibold">@{profile.username}</p>
              </div>
              <ProfilePreview
                username={profile.username}
                displayName={displayName || profile.display_name}
                avatarUrl={profile.avatar_url}
                bio={bio || profile.bio}
                primarySport={primarySport || profile.primary_sport}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {!isEditing ? (
        /* View Mode */
        <>
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Info</CardTitle>
              <CardDescription>Your basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <p className="text-body">{email}</p>
              </div>

              <div className="space-y-2">
                <Label>Full Name</Label>
                <p className="text-body">{fullName || "Not set"}</p>
              </div>

              <div className="space-y-2">
                <Label>Display Name</Label>
                <p className="text-body">{displayName || "Not set"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Athletics */}
          <Card>
            <CardHeader>
              <CardTitle>Athletics</CardTitle>
              <CardDescription>Your sport and team information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Primary Sport</Label>
                <p className="text-body">{primarySport || "Not set"}</p>
              </div>

              <div className="space-y-2">
                <Label>Team/Club</Label>
                <p className="text-body">{teamName || "Not set"}</p>
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
              <CardDescription>Tell other athletes about yourself</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Bio</Label>
                <p className="text-body whitespace-pre-wrap">{bio || "Not set"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Edit Button */}
          <div className="fixed bottom-16 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t md:relative md:bottom-auto md:left-auto md:right-auto md:p-0 md:bg-transparent md:backdrop-blur-none md:border-t-0">
            <Button 
              onClick={() => setIsEditing(true)}
              size="lg"
              className="w-full max-w-2xl mx-auto"
            >
              Edit Profile
            </Button>
          </div>
        </>
      ) : (
        /* Edit Mode */
        <>
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Info</CardTitle>
              <CardDescription>Your basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-caption text-muted-foreground">
                  🔒 Your email is managed through your account settings
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                />
              </div>
            </CardContent>
          </Card>

          {/* Athletics */}
          <Card>
            <CardHeader>
              <CardTitle>Athletics</CardTitle>
              <CardDescription>Your sport and team information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Primary Sport</Label>
                <SportSelector
                  value={primarySport}
                  onChange={setPrimarySport}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamName">Team/Club</Label>
                <Input
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter your team or club name"
                />
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
              <CardDescription>Tell other athletes about yourself</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself, your goals, achievements..."
                  rows={4}
                  className="resize-none"
                />
                <p className="text-caption text-muted-foreground">
                  {bio.length}/500 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save/Cancel Buttons */}
          <div className="fixed bottom-16 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t md:relative md:bottom-auto md:left-auto md:right-auto md:p-0 md:bg-transparent md:backdrop-blur-none md:border-t-0">
            <div className="flex gap-2 max-w-2xl mx-auto">
              <Button 
                onClick={handleSave} 
                disabled={saving} 
                size="lg"
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Button 
                onClick={() => {
                  setFullName(originalValues.fullName);
                  setDisplayName(originalValues.displayName);
                  setPrimarySport(originalValues.primarySport);
                  setTeamName(originalValues.teamName);
                  setBio(originalValues.bio);
                  setIsEditing(false);
                }}
                variant="outline"
                size="lg"
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Settings;
