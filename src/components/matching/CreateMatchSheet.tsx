import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Users, Swords, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SPORTS } from "@/lib/sports";

interface CreateMatchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CreateMatchSheet = ({ open, onOpenChange, onSuccess }: CreateMatchSheetProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userSport, setUserSport] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sport, setSport] = useState("");
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("20:00");
  const [location, setLocation] = useState("");
  const [lookingForPlayers, setLookingForPlayers] = useState(true);
  const [playersNeeded, setPlayersNeeded] = useState("4");

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("primary_sport")
          .eq("user_id", user.id)
          .single();
        
        if (data?.primary_sport) {
          setUserSport(data.primary_sport);
          setSport(data.primary_sport);
        }
      }
    };
    
    if (open) {
      fetchUserProfile();
    }
  }, [open]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSport(userSport || "");
    setDate(undefined);
    setStartTime("18:00");
    setEndTime("20:00");
    setLocation("");
    setLookingForPlayers(true);
    setPlayersNeeded("4");
  };

  const handleSubmit = async () => {
    if (!title.trim() || !date || !sport) {
      toast({
        title: "Missing information",
        description: "Please fill in the title, sport, and date.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const startDateTime = new Date(date);
      const [startHour, startMin] = startTime.split(":");
      startDateTime.setHours(parseInt(startHour), parseInt(startMin), 0, 0);

      const endDateTime = new Date(date);
      const [endHour, endMin] = endTime.split(":");
      endDateTime.setHours(parseInt(endHour), parseInt(endMin), 0, 0);

      const { data: event, error } = await supabase
        .from("events")
        .insert({
          title,
          description: description || null,
          type: "match",
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          location: location || null,
          is_public: true,
          looking_for_players: lookingForPlayers,
          players_needed: lookingForPlayers ? parseInt(playersNeeded) : null,
          max_participants: lookingForPlayers ? parseInt(playersNeeded) : null,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // If looking for players, trigger matching
      if (lookingForPlayers && event) {
        try {
          await supabase.functions.invoke("match-players", {
            body: { event_id: event.id },
          });
        } catch (matchError) {
          console.log("Matching will run in background");
        }
      }

      toast({
        title: "Match created!",
        description: lookingForPlayers 
          ? "We'll notify you when players are found."
          : "Your match has been created.",
      });

      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating match:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create match",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" />
            Create a Match
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Looking for Players Toggle - Prominent */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="space-y-0.5">
              <Label className="text-base font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Looking for Players
              </Label>
              <p className="text-sm text-muted-foreground">
                We'll automatically find players for your match
              </p>
            </div>
            <Switch
              checked={lookingForPlayers}
              onCheckedChange={setLookingForPlayers}
            />
          </div>

          {lookingForPlayers && (
            <div className="space-y-2">
              <Label htmlFor="playersNeeded">How many players do you need?</Label>
              <Select value={playersNeeded} onValueChange={setPlayersNeeded}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} player{num > 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Match Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Sunday Football Game"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Sport */}
          <div className="space-y-2">
            <Label>Sport *</Label>
            <Select value={sport} onValueChange={setSport}>
              <SelectTrigger>
                <SelectValue placeholder="Select a sport" />
              </SelectTrigger>
              <SelectContent>
                {SPORTS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Central Park Field 3"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Add any details about the match..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Swords className="mr-2 h-4 w-4" />
                Create Match
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
