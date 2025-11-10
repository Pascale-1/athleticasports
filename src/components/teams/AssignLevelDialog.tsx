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

const levelDescriptions = [
  { value: 1, label: "Level 1 - Elite", description: "Top performer with exceptional skills" },
  { value: 2, label: "Level 2 - Advanced", description: "Strong skills and consistent performance" },
  { value: 3, label: "Level 3 - Intermediate", description: "Developing skills and improving" },
  { value: 4, label: "Level 4 - Beginner", description: "Learning basics and fundamentals" },
];

export const AssignLevelDialog = ({
  open,
  onOpenChange,
  player,
  onAssign,
}: AssignLevelDialogProps) => {
  const [selectedLevel, setSelectedLevel] = useState<string>(
    player?.currentLevel?.toString() || "3"
  );
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

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
          <DialogTitle>Assign Performance Level</DialogTitle>
          <DialogDescription>
            Set the performance level for this player
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 py-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={player.avatarUrl || undefined} />
            <AvatarFallback>
              {player.displayName?.[0] || player.username[0]}
            </AvatarFallback>
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
            <Label>Performance Level</Label>
            <RadioGroup value={selectedLevel} onValueChange={setSelectedLevel}>
              {levelDescriptions.map((level) => (
                <div key={level.value} className="flex items-start space-x-3">
                  <RadioGroupItem value={level.value.toString()} id={`level-${level.value}`} className="mt-1" />
                  <Label
                    htmlFor={`level-${level.value}`}
                    className="flex-1 cursor-pointer space-y-1 font-normal"
                  >
                    <div className="flex items-center gap-2">
                      <PerformanceLevelBadge level={level.value} size="sm" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {level.description}
                    </p>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this assessment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
