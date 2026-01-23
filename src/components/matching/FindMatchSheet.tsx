import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, Loader2, MapPin, ChevronDown, Clock, Sparkles } from "lucide-react";
import { addDays, addWeeks, startOfDay, endOfDay, nextSaturday, nextSunday } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { getFeaturedSports, getRegularSports, getSportById } from "@/lib/sports";
import { getAllDistricts, getDistrictLabel } from "@/lib/parisDistricts";
import { usePlayerAvailability } from "@/hooks/usePlayerAvailability";

interface FindMatchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TimePreset = 'today' | 'tomorrow' | 'weekend' | 'week';

const TIME_PRESETS: { id: TimePreset; labelKey: string }[] = [
  { id: 'today', labelKey: 'presets.today' },
  { id: 'tomorrow', labelKey: 'presets.tomorrow' },
  { id: 'weekend', labelKey: 'presets.weekend' },
  { id: 'week', labelKey: 'presets.week' },
];

const getDateRangeFromPreset = (preset: TimePreset): { from: Date; to: Date } => {
  const now = new Date();
  switch (preset) {
    case 'today':
      return { from: startOfDay(now), to: endOfDay(now) };
    case 'tomorrow':
      return { from: startOfDay(addDays(now, 1)), to: endOfDay(addDays(now, 1)) };
    case 'weekend':
      return { from: startOfDay(nextSaturday(now)), to: endOfDay(nextSunday(now)) };
    case 'week':
    default:
      return { from: startOfDay(now), to: endOfDay(addWeeks(now, 1)) };
  }
};

export const FindMatchSheet = ({ open, onOpenChange }: FindMatchSheetProps) => {
  const { t, i18n } = useTranslation('matching');
  const lang = (i18n.language?.split('-')[0] || 'fr') as 'en' | 'fr';
  const { availability, createAvailability, cancelAvailability, loading: availabilityLoading } = usePlayerAvailability();
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // User defaults from profile
  const [userDefaults, setUserDefaults] = useState<{
    sport: string | null;
    district: string | null;
    skill: number;
  }>({ sport: null, district: null, skill: 3 });
  
  const featuredSports = getFeaturedSports();
  const regularSports = getRegularSports();
  const allDistricts = getAllDistricts();
  
  // Form state
  const [selectedPreset, setSelectedPreset] = useState<TimePreset>('week');
  const [sport, setSport] = useState("");
  const [district, setDistrict] = useState("");
  const [skillLevel, setSkillLevel] = useState([3]);

  // Fetch user defaults on open
  useEffect(() => {
    const fetchUserDefaults = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("primary_sport, preferred_district")
          .eq("user_id", user.id)
          .single();
        
        if (data) {
          setUserDefaults({
            sport: data.primary_sport,
            district: data.preferred_district,
            skill: 3,
          });
          // Pre-fill form with defaults
          if (data.primary_sport) setSport(data.primary_sport);
          if (data.preferred_district) setDistrict(data.preferred_district);
        }
      }
    };
    
    if (open) {
      fetchUserDefaults();
    }
  }, [open]);

  const handlePresetClick = (preset: TimePreset) => {
    setSelectedPreset(preset);
  };

  const handleSubmit = async () => {
    if (!sport) return;

    setLoading(true);
    try {
      const dateRange = getDateRangeFromPreset(selectedPreset);
        
      await createAvailability({
        sport,
        available_from: dateRange.from.toISOString(),
        available_until: dateRange.to.toISOString(),
        location_district: district && district !== 'any' ? district : undefined,
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

  // If already available, show status
  if (availability && !availabilityLoading) {
    const sportData = getSportById(availability.sport);
    const districtLabel = availability.location_district 
      ? getDistrictLabel(availability.location_district, lang)
      : availability.location;
      
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-auto max-h-[50vh]">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {t('availability.lookingTitle')}
            </SheetTitle>
            <SheetDescription>
              {t('availability.lookingDesc')}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-lg">
                  {sportData ? `${sportData.emoji} ${sportData.label[lang]}` : availability.sport}
                </span>
              </div>
              {districtLabel && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {districtLabel}
                </div>
              )}
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleCancel}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('availability.cancel')}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto max-h-[85vh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            {t('findGame.title')}
          </SheetTitle>
          <SheetDescription>
            {t('findGame.subtitle')}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5">
          {/* Time Presets - Primary Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {t('presets.whenTitle')}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {TIME_PRESETS.map(({ id, labelKey }) => (
                <Button
                  key={id}
                  type="button"
                  variant={selectedPreset === id ? 'default' : 'outline'}
                  onClick={() => handlePresetClick(id)}
                  className={cn(
                    "h-12 text-sm font-medium",
                    selectedPreset === id && "ring-2 ring-primary/20"
                  )}
                >
                  {t(labelKey)}
                </Button>
              ))}
            </div>
          </div>

          {/* Sport Selection */}
          <div className="space-y-2">
            <Label>{t('findGame.sportQuestion')} *</Label>
            <Select value={sport} onValueChange={setSport}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder={t('findGame.sportPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>{t('sports.popular')}</SelectLabel>
                  {featuredSports.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.emoji} {s.label[lang]}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>{t('sports.other')}</SelectLabel>
                  {regularSports.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.emoji} {s.label[lang]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Options - Collapsible */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between h-10 px-3 text-muted-foreground hover:text-foreground"
              >
                <span className="text-sm">{t('presets.moreOptions')}</span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  showAdvanced && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-2">
              {/* District Selection */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {t('findGame.locationQuestion')}
                </Label>
                <Select value={district} onValueChange={setDistrict}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('presets.anyArea')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">{t('presets.anyArea')}</SelectItem>
                    {allDistricts.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name[lang]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Skill Level */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>{t('findGame.yourLevel')}</Label>
                  <span className="text-sm font-medium text-primary">
                    {t(`skillLevels.${skillLevel[0]}`)}
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
                  <span>{t('skillLevels.1')}</span>
                  <span>{t('skillLevels.5')}</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Submit Button */}
          <Button
            className="w-full h-12"
            size="lg"
            onClick={handleSubmit}
            disabled={loading || !sport}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('findGame.settingUp')}
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                {t('findGame.makeAvailable')}
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            {t('findGame.expiryNote')}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};
