import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Users, Swords, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getFeaturedSports, getRegularSports } from "@/lib/sports";
import { DistrictSelector } from "@/components/location/DistrictSelector";
import { getDistrictLabel } from "@/lib/parisDistricts";

interface CreateMatchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CreateMatchSheet = ({ open, onOpenChange, onSuccess }: CreateMatchSheetProps) => {
  const { toast } = useToast();
  const { i18n, t } = useTranslation();
  const lang = (i18n.language?.split('-')[0] || 'fr') as 'en' | 'fr';
  const [loading, setLoading] = useState(false);
  const [userSport, setUserSport] = useState<string | null>(null);
  
  const featuredSports = getFeaturedSports();
  const regularSports = getRegularSports();
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sport, setSport] = useState("");
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("20:00");
  const [location, setLocation] = useState<{ district: string; venueName?: string }>({ district: '', venueName: '' });
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
    setLocation({ district: '', venueName: '' });
    setLookingForPlayers(true);
    setPlayersNeeded("4");
  };

  const handleSubmit = async () => {
    if (!title.trim() || !date || !sport) {
      toast({
        title: lang === 'fr' ? 'Information manquante' : 'Missing information',
        description: lang === 'fr' 
          ? 'Veuillez remplir le titre, le sport et la date.'
          : 'Please fill in the title, sport, and date.',
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

      const locationString = location.district 
        ? `${getDistrictLabel(location.district, lang)}${location.venueName ? ` - ${location.venueName}` : ''}`
        : null;

      const { data: event, error } = await supabase
        .from("events")
        .insert({
          title,
          description: description || null,
          type: "match",
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          location: locationString,
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
        title: lang === 'fr' ? 'Match créé !' : 'Match created!',
        description: lookingForPlayers 
          ? (lang === 'fr' ? 'Nous vous notifierons quand des joueurs seront trouvés.' : "We'll notify you when players are found.")
          : (lang === 'fr' ? 'Votre match a été créé.' : 'Your match has been created.'),
      });

      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating match:", error);
      toast({
        title: t('errors.generic'),
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
            {lang === 'fr' ? 'Créer une partie' : 'Create a Game'}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Looking for Players Toggle - Prominent */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="space-y-0.5">
              <Label className="text-base font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                {lang === 'fr' ? 'Recherche de joueurs' : 'Looking for Players'}
              </Label>
              <p className="text-sm text-muted-foreground">
                {lang === 'fr' 
                  ? 'Nous trouverons automatiquement des joueurs pour votre match'
                  : "We'll automatically find players for your match"}
              </p>
            </div>
            <Switch
              checked={lookingForPlayers}
              onCheckedChange={setLookingForPlayers}
            />
          </div>

          {lookingForPlayers && (
            <div className="space-y-2">
              <Label htmlFor="playersNeeded">
                {lang === 'fr' ? 'Combien de joueurs vous faut-il ?' : 'How many players do you need?'}
              </Label>
              <Select value={playersNeeded} onValueChange={setPlayersNeeded}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {lang === 'fr' ? (num > 1 ? 'joueurs' : 'joueur') : (num > 1 ? 'players' : 'player')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">{lang === 'fr' ? 'Titre de la partie' : 'Game Title'} *</Label>
            <Input
              id="title"
              placeholder={lang === 'fr' ? 'ex: Match de football dimanche' : 'e.g., Sunday Football Game'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Sport */}
          <div className="space-y-2">
            <Label>{lang === 'fr' ? 'Sport' : 'Sport'} *</Label>
            <Select value={sport} onValueChange={setSport}>
              <SelectTrigger>
                <SelectValue placeholder={lang === 'fr' ? 'Sélectionner un sport' : 'Select a sport'} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>{lang === 'fr' ? '⭐ Populaires' : '⭐ Popular'}</SelectLabel>
                  {featuredSports.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.emoji} {s.label[lang]}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>{lang === 'fr' ? 'Autres sports' : 'Other sports'}</SelectLabel>
                  {regularSports.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.emoji} {s.label[lang]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>{lang === 'fr' ? 'Date' : 'Date'} *</Label>
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
                  {date ? format(date, "PPP") : (lang === 'fr' ? 'Choisir une date' : 'Pick a date')}
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
              <Label htmlFor="startTime">{lang === 'fr' ? 'Heure de début' : 'Start Time'}</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">{lang === 'fr' ? 'Heure de fin' : 'End Time'}</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Location - District Selector */}
          <DistrictSelector
            value={location}
            onChange={setLocation}
            label={lang === 'fr' ? 'Lieu' : 'Location'}
            venueLabel={lang === 'fr' ? 'Nom du terrain/club (optionnel)' : 'Venue/Club name (optional)'}
            venuePlaceholder={lang === 'fr' ? 'ex: Stade Charléty' : 'e.g., Central Park Field 3'}
          />

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{lang === 'fr' ? 'Description (optionnel)' : 'Description (optional)'}</Label>
            <Textarea
              id="description"
              placeholder={lang === 'fr' ? 'Ajoutez des détails sur le match...' : 'Add any details about the match...'}
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
                {lang === 'fr' ? 'Création...' : 'Creating...'}
              </>
            ) : (
              <>
                <Swords className="mr-2 h-4 w-4" />
                {lang === 'fr' ? 'Créer la partie' : 'Create Game'}
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
