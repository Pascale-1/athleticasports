import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Activity, useActivities } from "@/hooks/useActivities";

export const LogActivityDialog = () => {
  const { createActivity } = useActivities();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Activity>>({
    type: "run",
    title: "",
    description: "",
    distance: undefined,
    duration: undefined,
    calories: undefined,
    date: new Date().toISOString(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.type) return;

    await createActivity(formData as Omit<Activity, 'id' | 'user_id' | 'created_at' | 'updated_at'>);
    setOpen(false);
    setFormData({
      type: "run",
      title: "",
      description: "",
      distance: undefined,
      duration: undefined,
      calories: undefined,
      date: new Date().toISOString(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Log Activity
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log New Activity</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <Button type="submit" className="w-full">
            Log Activity
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
