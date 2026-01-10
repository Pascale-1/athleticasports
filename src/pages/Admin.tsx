import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
}

interface ProfileWithRoles extends Profile {
  roles: string[];
}

const Admin = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<ProfileWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Utiliser la fonction RPC securisee pour verifier le role admin
      const { data: isUserAdmin, error } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });

      if (error) {
        console.error('Error checking admin status:', error);
        toast.error("Error verifying admin access");
        navigate('/');
        return;
      }

      if (!isUserAdmin) {
        toast.error("You don't have admin access");
        navigate('/');
        return;
      }

      setIsAdmin(true);
      fetchProfiles();
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/');
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('username');

      if (profilesError) throw profilesError;

      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('*');

      const profilesWithRoles = profilesData.map(profile => ({
        ...profile,
        roles: rolesData
          ?.filter(r => r.user_id === profile.user_id)
          .map(r => r.role) || []
      }));

      setProfiles(profilesWithRoles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      // Remove existing roles
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        // RLS policy violation - user is not admin
        if (deleteError.code === '42501' || deleteError.message.includes('policy')) {
          toast.error("Access denied: Admin privileges required");
          navigate('/');
          return;
        }
        throw deleteError;
      }

      // Add new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: newRole as any }]);

      if (insertError) {
        // RLS policy violation - user is not admin
        if (insertError.code === '42501' || insertError.message.includes('policy')) {
          toast.error("Access denied: Admin privileges required");
          navigate('/');
          return;
        }
        throw insertError;
      }

      toast.success("Role updated successfully");
      fetchProfiles();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error("Failed to update role");
    }
  };

  if (!isAdmin || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage user roles and permissions</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Assign roles to users. Changes take effect immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-lg border gap-3 sm:gap-4"
              >
                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="text-sm">
                      {profile.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">@{profile.username}</p>
                    {profile.display_name && (
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {profile.display_name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <div className="flex gap-2 flex-wrap">
                    {profile.roles.map(role => (
                      <Badge key={role} variant={role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                  <Select
                    value={profile.roles[0] || 'user'}
                    onValueChange={(value) => handleRoleChange(profile.user_id, value)}
                  >
                    <SelectTrigger className="w-full sm:w-[140px] min-h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
