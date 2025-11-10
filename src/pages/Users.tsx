import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Users as UsersIcon } from "lucide-react";
import { FollowButton } from "@/components/FollowButton";
import { useFollowers } from "@/hooks/useFollowers";

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

interface ProfileWithRoles extends Profile {
  roles: string[];
}

const Users = () => {
  const [profiles, setProfiles] = useState<ProfileWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role');

      const profilesWithRoles = profilesData.map(profile => ({
        ...profile,
        roles: rolesData
          ?.filter(r => r.user_id === profile.user_id)
          .map(r => r.role) || []
      }));

      setProfiles(profilesWithRoles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users Directory</h1>
        <p className="text-muted-foreground">Browse all registered users</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProfiles.map((profile) => {
          const UserCard = () => {
            const { followerCount } = useFollowers(profile.user_id);
            
            return (
              <Card key={profile.id} className="hover-scale">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile.avatar_url || undefined} />
                      <AvatarFallback className="text-xl">
                        {profile.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-1 w-full">
                      <h3 className="font-semibold text-lg">@{profile.username}</h3>
                      {profile.display_name && (
                        <p className="text-sm text-muted-foreground">{profile.display_name}</p>
                      )}
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground pt-1">
                        <UsersIcon className="h-3 w-3" />
                        <span>{followerCount} {followerCount === 1 ? 'follower' : 'followers'}</span>
                      </div>
                    </div>

                    {profile.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>
                    )}

                    {profile.roles.length > 0 && (
                      <div className="flex gap-2 flex-wrap justify-center">
                        {profile.roles.map(role => (
                          <Badge key={role} variant={role === 'admin' ? 'default' : 'secondary'}>
                            {role}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-col gap-2 w-full">
                      <FollowButton userId={profile.user_id} username={profile.username} />
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(profile.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          };
          
          return <UserCard key={profile.id} />;
        })}
      </div>

      {filteredProfiles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No users found</p>
        </div>
      )}
    </div>
  );
};

export default Users;
