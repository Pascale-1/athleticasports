import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { CalendarIcon, Search, Loader2, MapPin } from "lucide-react";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { getFeaturedSports, getRegularSports, getSportById } from "@/lib/sports";
import { DistrictSelector } from "@/components/location/DistrictSelector";
import { getDistrictLabel } from "@/lib/parisDistricts";
import { usePlayerAvailability } from "@/hooks/usePlayerAvailability";

interface FindMatchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SKILL_LABELS = {
  en: ["Beginner", "Novice", "Intermediate", "Advanced", "Expert"],
  fr: ["Débutant", "Novice", "Intermédiaire", "Avancé", "Expert"],
};

export const FindMatchSheet = ({ open, onOpenChange }: FindMatchSheetProps) => {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language?.split('-')[0] || 'fr') as 'en' | 'fr';
  const { availability, createAvailability, cancelAvailability, loading: availabilityLoading } = usePlayerAvailability();
  const [loading, setLoading] = useState(false);
  const [userSport, setUserSport] = useState<string | null>(null);
  
  const featuredSports = getFeaturedSports();
  const regularSports = getRegularSports();
  
  // Form state
  const [sport, setSport] = useState("");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });
  const [location, setLocation] = useState<{ district: string; venueName?: string }>({ district: '', venueName: '' });
  const [skillLevel, setSkillLevel] = useState([3]);

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

  const handleSubmit = async () => {
    if (!sport) return;

    setLoading(true);
    try {
      const locationString = location.district 
        ? `${getDistrictLabel(location.district, lang)}${location.venueName ? ` - ${location.venueName}` : ''}`
        : undefined;
        
      await createAvailability({
        sport,
        available_from: dateRange.from.toISOString(),
        available_until: dateRange.to.toISOString(),
        location: locationString,
        skill_level: skillLevel[0],
      });
      
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await cancelAvailability();
    } finally {
      setLoading(false);
    }
  };

  // If user has active availability, show status instead
  if (availability && !availabilityLoading) {
    const sportData = getSportById(availability.sport);
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              {lang === 'fr' ? 'Vous recherchez des matchs' : "You're Looking for Matches"}
            </SheetTitle>
            <SheetDescription>
              {lang === 'fr' 
                ? 'Nous vous notifierons quand nous trouverons un match adapté.'
                : "We'll notify you when we find a match that fits your availability."}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {sportData ? `${sportData.emoji} ${sportData.label[lang]}` : availability.sport}
                </span>
                <span className="text-sm text-muted-foreground">
                  {lang === 'fr' ? "Jusqu'au" : 'Until'} {format(new Date(availability.available_until), "d MMM")}
                </span>
              </div>
              {availability.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {availability.location}
                </div>
              )}
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleCancel}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {lang === 'fr' ? 'Annuler ma disponibilité' : 'Cancel Availability'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            {lang === 'fr' ? 'Trouver un match' : 'Find a Match'}
          </SheetTitle>
          <SheetDescription>
            {lang === 'fr' 
              ? 'Indiquez vos disponibilités et nous trouverons des matchs pour vous.'
              : "Tell us when and where you're available, and we'll find matches for you."}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Sport */}
          <div className="space-y-2">
            <Label>{lang === 'fr' ? 'Quel sport voulez-vous jouer ?' : 'What sport do you want to play?'} *</Label>
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

          {/* Date Range - From */}
          <div className="space-y-2">
            <Label>{lang === 'fr' ? 'Disponible à partir du' : 'Available from'}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dateRange.from, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date) => date && setDateRange(prev => ({ ...prev, from: date }))}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Date Range - To */}
          <div className="space-y-2">
            <Label>{lang === 'fr' ? "Disponible jusqu'au" : 'Available until'}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dateRange.to, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  onSelect={(date) => date && setDateRange(prev => ({ ...prev, to: date }))}
                  disabled={(date) => date < dateRange.from}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Location - District Selector */}
          <DistrictSelector
            value={location}
            onChange={setLocation}
            label={lang === 'fr' ? 'Où pouvez-vous jouer ?' : 'Where can you play?'}
            venueLabel={lang === 'fr' ? 'Lieu précis (optionnel)' : 'Specific venue (optional)'}
          />

          {/* Skill Level */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>{lang === 'fr' ? 'Votre niveau' : 'Your skill level'}</Label>
              <span className="text-sm font-medium text-primary">
                {SKILL_LABELS[lang][skillLevel[0] - 1]}
              </span>
            </div>
            <Slider
              value={skillLevel}
              onValueChange={setSkillLevel}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{SKILL_LABELS[lang][0]}</span>
              <span>{SKILL_LABELS[lang][4]}</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={loading || !sport}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {lang === 'fr' ? 'Configuration...' : 'Setting up...'}
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                {lang === 'fr' ? 'Me rendre disponible' : 'Make Me Available'}
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            {lang === 'fr' 
              ? 'Votre disponibilité expirera dans 7 jours. Vous pouvez annuler à tout moment.'
              : 'Your availability will expire in 7 days. You can cancel anytime.'}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};
