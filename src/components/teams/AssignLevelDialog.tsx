import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PerformanceLevelBadge } from "./PerformanceLevelBadge";

interface AssignLevelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: {
    userId: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    currentLevel: number | null;
  } | null;
  onAssign: (userId: string, level: number, notes?: string) => Promise<void>;
}

export const AssignLevelDialog = ({ open, onOpenChange, player, onAssign }: AssignLevelDialogProps) => {
  const { t } = useTranslation("common");
  const [selectedLevel, setSelectedLevel] = useState<string>(player?.currentLevel?.toString() || "3");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const levelDescriptions = [
    { value: 1, description: t("performance.levelDescriptions.1") },
    { value: 2, description: t("performance.levelDescriptions.2") },
    { value: 3, description: t("performance.levelDescriptions.3") },
    { value: 4, description: t("performance.levelDescriptions.4") },
  ];

  const handleSave = async () => {
    if (!player) return;
    setSaving(true);
    try {
      await onAssign(player.userId, parseInt(selectedLevel), notes || undefined);
      onOpenChange(false);
      setNotes("");
    } finally {
      setSaving(false);
    }
  };

  if (!player) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("performance.assignLevel")}</DialogTitle>
          <DialogDescription>{t("performance.assignLevelDesc")}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 py-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={player.avatarUrl || undefined} />
            <AvatarFallback>{player.displayName?.[0] || player.username[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{player.displayName || player.username}</p>
            <p className="text-sm text-muted-foreground">@{player.username}</p>
          </div>
          {player.currentLevel && (
            <div className="ml-auto">
              <PerformanceLevelBadge level={player.currentLevel} size="sm" />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <Label>{t("performance.levelLabel")}</Label>
            <RadioGroup value={selectedLevel} onValueChange={setSelectedLevel}>
              {levelDescriptions.map((level) => (
                <div key={level.value} className="flex items-start space-x-3">
                  <RadioGroupItem value={level.value.toString()} id={`level-${level.value}`} className="mt-1" />
                  <Label htmlFor={`level-${level.value}`} className="flex-1 cursor-pointer space-y-1 font-normal">
                    <div className="flex items-center gap-2">
                      <PerformanceLevelBadge level={level.value} size="sm" />
                    </div>
                    <p className="text-sm text-muted-foreground">{level.description}</p>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("performance.notesOptional")}</Label>
            <Textarea
              id="notes"
              placeholder={t("performance.notesPlaceholder")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("actions.cancel")}</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? t("performance.saving") : t("actions.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
