import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Team, deleteTeam, transferTeamOwnership } from "@/lib/teams";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Trash2, UserCog } from "lucide-react";

interface TeamDangerZoneProps {
  team: Team;
}

export const TeamDangerZone = ({ team }: TeamDangerZoneProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { members } = useTeamMembers(team.id);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [selectedNewOwner, setSelectedNewOwner] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  const admins = members.filter(
    (m) => m.role === "admin" || m.role === "coach"
  );

  const handleDeleteTeam = async () => {
    if (deleteConfirmation !== team.name) {
      toast({
        title: "Error",
        description: "Team name doesn't match",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      await deleteTeam(team.id);
      toast({
        title: "Success",
        description: "Team deleted successfully",
      });
      navigate("/teams");
    } catch (error) {
      console.error("Error deleting team:", error);
      toast({
        title: "Error",
        description: "Failed to delete team",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTransferOwnership = async () => {
    if (!selectedNewOwner) {
      toast({
        title: "Error",
        description: "Please select a new owner",
        variant: "destructive",
      });
      return;
    }

    setIsTransferring(true);
    try {
      await transferTeamOwnership(team.id, selectedNewOwner);
      toast({
        title: "Success",
        description: "Ownership transferred successfully",
      });
      navigate(`/teams/${team.id}`);
    } catch (error) {
      console.error("Error transferring ownership:", error);
      toast({
        title: "Error",
        description: "Failed to transfer ownership",
        variant: "destructive",
      });
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="rounded-lg border-2 border-destructive/50 bg-destructive/5 p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <h2 className="text-xl font-semibold text-destructive">Danger Zone</h2>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border bg-background p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            Transfer Ownership
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Transfer ownership to another admin or coach. You will become an
            admin.
          </p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={admins.length === 0}>
                Transfer Ownership
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Transfer Team Ownership</AlertDialogTitle>
                <AlertDialogDescription>
                  Select a new owner for this team. You will be demoted to
                  admin status.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4">
                <Label htmlFor="new-owner">New Owner</Label>
                <Select
                  value={selectedNewOwner}
                  onValueChange={setSelectedNewOwner}
                >
                  <SelectTrigger id="new-owner">
                    <SelectValue placeholder="Select a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {admins.map((admin) => (
                      <SelectItem key={admin.user_id} value={admin.user_id}>
                        {admin.profile.display_name || admin.profile.username} (
                        {admin.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleTransferOwnership}
                  disabled={isTransferring}
                >
                  {isTransferring ? "Transferring..." : "Transfer Ownership"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="rounded-lg border bg-background p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Delete Team
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete this team and all associated data. This action
            cannot be undone.
          </p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Team</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  team, all members, announcements, training sessions, and
                  associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4">
                <Label htmlFor="confirm-name">
                  Type <strong>{team.name}</strong> to confirm
                </Label>
                <Input
                  id="confirm-name"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Team name"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteConfirmation("")}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteTeam}
                  disabled={deleteConfirmation !== team.name || isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Delete Team"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};
