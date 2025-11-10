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
  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [primarySport, setPrimarySport] = useState("");
  const [teamName, setTeamName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      setProfile(data);
      if (data) {
        setFullName(data.full_name || "");
        setDisplayName(data.display_name || "");
        setPrimarySport(data.primary_sport || "");
        setTeamName(data.team_name || "");
        setBio(data.bio || "");
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
        navigate("/");
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
        navigate("/");
      }

      fetchProfile();
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
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 animate-fade-in px-3 sm:px-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage your profile settings</p>
      </div>

      {profile && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Upload a profile picture for your account</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 p-4 sm:p-6">
            <Avatar className="h-20 w-20 md:h-24 md:w-24">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-xl md:text-2xl">
                {profile.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          <div className="w-full sm:w-auto">
            <Input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={uploading}
              className="hidden"
            />
            <Label htmlFor="avatar" className="w-full sm:w-auto">
              <Button asChild disabled={uploading} className="w-full sm:w-auto min-h-11">
                <span className="cursor-pointer">
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span className="text-xs sm:text-sm">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      <span className="text-xs sm:text-sm">Upload Avatar</span>
                    </>
                  )}
                </span>
              </Button>
            </Label>
          </div>
        </CardContent>
      </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile && (
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={profile.username}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Your username cannot be changed
              </p>
            </div>
          )}
          
          {!profile && (
            <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              A unique username will be generated for you automatically
            </div>
          )}

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

          <div className="space-y-2">
            <Label htmlFor="primarySport">Primary Sport</Label>
            <select
              id="primarySport"
              value={primarySport}
              onChange={(e) => setPrimarySport(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a sport</option>
              <option value="Basketball">Basketball</option>
              <option value="Football">Football</option>
              <option value="Soccer">Soccer</option>
              <option value="Baseball">Baseball</option>
              <option value="Tennis">Tennis</option>
              <option value="Volleyball">Volleyball</option>
              <option value="Swimming">Swimming</option>
              <option value="Track & Field">Track & Field</option>
              <option value="Hockey">Hockey</option>
              <option value="Other">Other</option>
            </select>
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

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              rows={4}
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {profile ? "Saving..." : "Creating..."}
              </>
            ) : (
              profile ? "Save Changes" : "Create Profile"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
