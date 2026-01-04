import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, UserPlus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchedUser {
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (emailOrUserId: string, isUserId?: boolean, role?: string) => void;
  teamId: string | null;
  canManage: boolean;
}

export const InviteMemberDialog = ({ open, onOpenChange, onInvite, teamId, canManage }: InviteMemberDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("member");
  const [users, setUsers] = useState<SearchedUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2 || !teamId) {
      setUsers([]);
      return;
    }

    const searchUsers = async () => {
      setLoading(true);
      try {
        // Get current team members to exclude them
        const { data: teamMembers } = await supabase
          .from("team_members")
          .select("user_id")
          .eq("team_id", teamId)
          .eq("status", "active");

        const excludedUserIds = teamMembers?.map(m => m.user_id) || [];

        // Sanitize query to prevent SQL injection
        const sanitizedQuery = searchQuery.replace(/[%_]/g, '\\$&');
        
        // Search for users by username or display name
        const { data, error } = await supabase
          .from("profiles")
          .select("user_id, username, display_name, avatar_url")
          .or(`username.ilike.%${sanitizedQuery}%,display_name.ilike.%${sanitizedQuery}%`)
          .limit(5);

        if (error) throw error;

        // Filter out existing team members
        const filteredUsers = data?.filter(
          user => !excludedUserIds.includes(user.user_id)
        ) || [];

        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error searching users:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, teamId]);

  const handleSelectUser = (userId: string) => {
    onInvite(userId, true, selectedRole);
    setSearchQuery("");
    setSelectedRole("member");
    onOpenChange(false);
  };

  const handleInviteByEmail = () => {
    if (searchQuery.trim() && searchQuery.includes("@")) {
      onInvite(searchQuery.trim(), false, selectedRole);
      setSearchQuery("");
      setSelectedRole("member");
      onOpenChange(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "secondary";
      case "coach":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-3 sm:mx-auto max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Invite Team Member</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Search for users by username or display name, or invite by email.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search Users</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by username or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                {canManage && (
                  <>
                    <SelectItem value="coach">Coach</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {searchQuery.trim().length >= 2 && (
            <ScrollArea className="h-[200px] border rounded-md">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : users.length > 0 ? (
                <div className="p-2 space-y-1">
                  {users.map((user) => (
                    <button
                      key={user.user_id}
                      onClick={() => handleSelectUser(user.user_id)}
                      className="w-full flex items-center gap-3 p-2 hover:bg-accent rounded-md transition-colors text-left"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>
                          {(user.display_name || user.username).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.display_name || user.username}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          @{user.username}
                        </p>
                      </div>
                      <Badge variant={getRoleBadgeVariant(selectedRole)}>
                        {selectedRole}
                      </Badge>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    No users found matching "{searchQuery}"
                  </p>
                  {searchQuery.includes("@") && (
                    <Button
                      size="sm"
                      onClick={handleInviteByEmail}
                      className="min-h-9"
                    >
                      Invite {searchQuery} by email
                    </Button>
                  )}
                </div>
              )}
            </ScrollArea>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="min-h-11">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
