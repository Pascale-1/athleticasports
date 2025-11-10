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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Users, TrendingUp } from "lucide-react";

interface GenerateTeamsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (numTeams: number) => Promise<void>;
  totalPlayers: number;
  generating: boolean;
}

export const GenerateTeamsDialog = ({
  open,
  onOpenChange,
  onGenerate,
  totalPlayers,
  generating,
}: GenerateTeamsDialogProps) => {
  const [numTeams, setNumTeams] = useState("2");

  const playersPerTeam = Math.floor(totalPlayers / parseInt(numTeams));

  const handleGenerate = async () => {
    await onGenerate(parseInt(numTeams));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Balanced Teams</DialogTitle>
          <DialogDescription>
            Create balanced practice teams based on player performance levels
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Player count */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">{totalPlayers} Players Available</p>
              <p className="text-sm text-muted-foreground">
                Active team members
              </p>
            </div>
          </div>

          {/* Number of teams */}
          <div className="space-y-3">
            <Label>Number of Teams</Label>
            <RadioGroup value={numTeams} onValueChange={setNumTeams}>
              {[2, 3, 4, 5, 6].map((num) => (
                <div key={num} className="flex items-center space-x-3">
                  <RadioGroupItem value={num.toString()} id={`teams-${num}`} />
                  <Label htmlFor={`teams-${num}`} className="flex-1 cursor-pointer font-normal">
                    <div className="flex items-center justify-between">
                      <span>{num} Teams</span>
                      <span className="text-sm text-muted-foreground">
                        ~{Math.floor(totalPlayers / num)} players each
                      </span>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Preview */}
          <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
            <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-sm">Smart Balancing</p>
              <p className="text-sm text-muted-foreground mt-1">
                Teams will be automatically balanced by average performance level to ensure fair practice matches
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={generating}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? "Generating..." : "Generate Teams"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
