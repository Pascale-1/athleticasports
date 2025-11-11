import { useState } from "react";
import { Drawer } from "vaul";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Lock, Globe, X } from "lucide-react";
import { Activity, useActivities } from "@/hooks/useActivities";

interface LogActivitySheetProps {
  onClose: () => void;
}

export const LogActivitySheet = ({ onClose }: LogActivitySheetProps) => {
  const { createActivity } = useActivities();
  const [formData, setFormData] = useState<Partial<Activity> & { visibility?: string }>({
    type: "run",
    title: "",
    description: "",
    distance: undefined,
    duration: undefined,
    calories: undefined,
    date: new Date().toISOString(),
    visibility: "team",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.type) return;

    await createActivity(formData as Omit<Activity, 'id' | 'user_id' | 'created_at' | 'updated_at'>);
    onClose();
  };

  return (
    <Drawer.Root open onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="bg-background flex flex-col rounded-t-[10px] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-50">
          <div className="p-4 bg-background rounded-t-[10px] flex-1 overflow-y-auto">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-8" />
            <div className="flex items-center justify-between mb-6">
              <Drawer.Title className="text-xl font-bold">Log New Activity</Drawer.Title>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="type">Activity Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as Activity['type'] })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="run">Run</SelectItem>
                    <SelectItem value="cycle">Cycle</SelectItem>
                    <SelectItem value="workout">Workout</SelectItem>
                    <SelectItem value="swim">Swim</SelectItem>
                    <SelectItem value="walk">Walk</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Morning run"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add notes about your activity..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="distance">Distance (km)</Label>
                  <Input
                    id="distance"
                    type="number"
                    step="0.1"
                    value={formData.distance || ""}
                    onChange={(e) => setFormData({ ...formData, distance: parseFloat(e.target.value) })}
                    placeholder="5.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration || ""}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    placeholder="30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={formData.calories || ""}
                    onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) })}
                    placeholder="250"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={formData.date?.slice(0, 16)}
                  onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value).toISOString() })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Who can see this?</Label>
                <Select value={formData.visibility} onValueChange={(value) => setFormData({ ...formData, visibility: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        <span>Private - Only me</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="team">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Team - Teammates & followers</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>Public - Everyone</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 space-y-2">
                <Button type="submit" className="w-full h-12">
                  Log Activity
                </Button>
                <Button type="button" variant="outline" className="w-full h-12" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};