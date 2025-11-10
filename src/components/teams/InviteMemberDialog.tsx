import { useState } from "react";
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
import { useUserSearch } from "@/hooks/useUserSearch";
import { Loader2, Search, UserPlus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (emailOrUserId: string, isUserId?: boolean) => void;
  teamId: string | null;
}

export const InviteMemberDialog = ({ open, onOpenChange, onInvite, teamId }: InviteMemberDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { users, loading } = useUserSearch(searchQuery, teamId);

  const handleSelectUser = (userId: string) => {
    onInvite(userId, true);
    setSearchQuery("");
    onOpenChange(false);
  };

  const handleInviteByEmail = () => {
    if (searchQuery.trim() && searchQuery.includes("@")) {
      onInvite(searchQuery.trim(), false);
      setSearchQuery("");
      onOpenChange(false);
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
                      <UserPlus className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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
