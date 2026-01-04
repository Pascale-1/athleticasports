import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation('teams');
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
        title: t('toast.nameError'),
        description: t('toast.nameError'),
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      await deleteTeam(team.id);
      toast({
        title: t('toast.deleteSuccess'),
        description: t('toast.deleteSuccess'),
      });
      navigate("/teams");
    } catch (error) {
      console.error("Error deleting team:", error);
      toast({
        title: t('toast.deleteError'),
        description: t('toast.deleteError'),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTransferOwnership = async () => {
    if (!selectedNewOwner) {
      toast({
        title: t('toast.selectOwnerError'),
        description: t('toast.selectOwnerError'),
        variant: "destructive",
      });
      return;
    }

    setIsTransferring(true);
    try {
      await transferTeamOwnership(team.id, selectedNewOwner);
      toast({
        title: t('toast.transferSuccess'),
        description: t('toast.transferSuccess'),
      });
      navigate(`/teams/${team.id}`);
    } catch (error) {
      console.error("Error transferring ownership:", error);
      toast({
        title: t('toast.transferError'),
        description: t('toast.transferError'),
        variant: "destructive",
      });
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="rounded-lg border-2 border-destructive/50 bg-destructive/5 p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <h2 className="text-lg font-semibold text-destructive">{t('danger.title')}</h2>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border bg-background p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            {t('danger.transferOwnership')}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('danger.transferDesc')}
          </p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={admins.length === 0} className="h-11">
                {t('danger.transferOwnership')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('danger.transferDialogTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('danger.transferDialogDesc')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4">
                <Label htmlFor="new-owner">{t('danger.newOwner')}</Label>
                <Select
                  value={selectedNewOwner}
                  onValueChange={setSelectedNewOwner}
                >
                  <SelectTrigger id="new-owner" className="h-11">
                    <SelectValue placeholder={t('danger.selectMember')} />
                  </SelectTrigger>
                  <SelectContent>
                    {admins.map((admin) => (
                      <SelectItem key={admin.user_id} value={admin.user_id}>
                        {admin.profile.display_name || admin.profile.username} ({t(`roles.${admin.role}`)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('danger.cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleTransferOwnership}
                  disabled={isTransferring}
                >
                  {isTransferring ? t('danger.transferring') : t('danger.transferOwnership')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="rounded-lg border bg-background p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            {t('danger.deleteTeam')}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('danger.deleteDesc')}
          </p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="h-11">{t('danger.deleteTeam')}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t('danger.confirmDelete')}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t('danger.confirmDeleteDesc')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4">
                <Label htmlFor="confirm-name">
                  {t('danger.typeToConfirm', { name: team.name })}
                </Label>
                <Input
                  id="confirm-name"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder={t('danger.teamNamePlaceholder')}
                  className="h-11 mt-2"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteConfirmation("")}>
                  {t('danger.cancel')}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteTeam}
                  disabled={deleteConfirmation !== team.name || isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? t('danger.deleting') : t('danger.deleteTeam')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};
