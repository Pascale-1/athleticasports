import { useState } from "react";
import { Team, updateTeam } from "@/lib/teams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface TeamGeneralSettingsProps {
  team: Team;
}

export const TeamGeneralSettings = ({ team }: TeamGeneralSettingsProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: team.name,
    description: team.description || "",
    is_private: team.is_private,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateTeam(team.id, {
        name: formData.name,
        description: formData.description || null,
        is_private: formData.is_private,
      });

      toast({
        title: "Success",
        description: "Team settings updated successfully",
      });
    } catch (error) {
      console.error("Error updating team:", error);
      toast({
        title: "Error",
        description: "Failed to update team settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-6">
      <h2 className="text-xl font-semibold mb-4">General Settings</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Team Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="privacy">Private Team</Label>
            <p className="text-sm text-muted-foreground">
              {formData.is_private
                ? "Only members can view this team"
                : "Anyone can view this team"}
            </p>
          </div>
          <Switch
            id="privacy"
            checked={formData.is_private}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, is_private: checked })
            }
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};
