import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createTeam } from "@/lib/teams";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const TeamCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_private: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const team = await createTeam(formData);
      toast({
        title: "Success",
        description: "Team created successfully",
      });
      navigate(`/teams/${team.id}`);
    } catch (error: any) {
      console.error("Error creating team:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create team",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/teams")}
        className="mb-4 sm:mb-6 min-h-11"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        <span className="text-xs sm:text-sm">Back to Teams</span>
      </Button>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl">Create New Team</CardTitle>
          <CardDescription className="text-sm">
            Set up a new team to organize training sessions and communicate with members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter team name"
                required
                minLength={2}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tell others about your team..."
                rows={4}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="private">Private Team</Label>
                <p className="text-sm text-muted-foreground">
                  Only members can see and join this team
                </p>
              </div>
              <Switch
                id="private"
                checked={formData.is_private}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_private: checked })
                }
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/teams")}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Creating..." : "Create Team"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamCreate;
