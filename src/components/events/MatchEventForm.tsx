import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Home, Plane, Scale } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CreateEventData } from "@/hooks/useEvents";
import { TeamSelector } from "@/components/teams/TeamSelector";
import { MyTeamSelector } from "@/components/teams/MyTeamSelector";
import { useTeam } from "@/hooks/useTeam";
import { DistrictSelector } from "@/components/location/DistrictSelector";
import { DurationPicker } from "./DurationPicker";
import { SportQuickSelector } from "./SportQuickSelector";
import { getSportDefaults, getPlayersForFormat } from "@/lib/sportDefaults";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  opponentName: z.string().max(100).optional(),
  homeAway: z.enum(['home', 'away', 'neutral']),
  description: z.string().max(500).optional(),
  date: z.date({ required_error: "Date is required" }),
  startTime: z.string().min(1, "Start time is required"),
  maxParticipants: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface MatchEventFormProps {
  teamId?: string;
  sport?: string;
  onSubmit: (data: CreateEventData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const MatchEventForm = ({ teamId, sport: initialSport, onSubmit, onCancel, isSubmitting }: MatchEventFormProps) => {
  const { i18n, t } = useTranslation('events');
  const lang = (i18n.language?.split('-')[0] || 'fr') as 'en' | 'fr';
  const [useTeamSelector, setUseTeamSelector] = useState(true);
  const [homeTeamId, setHomeTeamId] = useState<string | null>(teamId || null);
  const [opponentTeamId, setOpponentTeamId] = useState<string | null>(null);
  const [opponentTeamName, setOpponentTeamName] = useState<string>("");
  const [opponentLogoUrl, setOpponentLogoUrl] = useState<string>("");
  const [location, setLocation] = useState<{ district: string; venueName?: string }>({ district: '', venueName: '' });
  const [selectedSport, setSelectedSport] = useState<string | null>(initialSport || null);
  const [duration, setDuration] = useState(90);
  
  const { team: homeTeam } = useTeam(teamId);
  const sportDefaults = getSportDefaults(selectedSport || homeTeam?.sport);
  const effectiveSport = selectedSport || homeTeam?.sport;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      opponentName: "",
      homeAway: 'home',
      description: "",
      startTime: "15:00",
      maxParticipants: "",
    },
  });

  // Update duration when sport changes
  useEffect(() => {
    if (effectiveSport) {
      setDuration(sportDefaults.duration);
    }
  }, [effectiveSport, sportDefaults.duration]);

  // Reset opponent and home team when sport changes (only if no fixed teamId)
  useEffect(() => {
    if (selectedSport && !teamId) {
      setOpponentTeamId(null);
      setOpponentTeamName("");
      setOpponentLogoUrl("");
      setHomeTeamId(null);
    }
  }, [selectedSport, teamId]);

  // Auto-generate title when teams are selected
  useEffect(() => {
    const currentTitle = form.getValues('title');
    if (!currentTitle && homeTeam && opponentTeamName) {
      form.setValue('title', `${homeTeam.name} vs ${opponentTeamName}`);
    }
  }, [homeTeam, opponentTeamName, form]);

  const handleSubmit = (values: FormData) => {
    const startDateTime = new Date(values.date);
    const [startHour, startMinute] = values.startTime.split(':');
    startDateTime.setHours(parseInt(startHour), parseInt(startMinute));

    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + duration);

    const locationString = location.venueName || undefined;

    onSubmit({
      team_id: homeTeamId || null,
      opponent_team_id: opponentTeamId || null,
      type: 'match',
      title: values.title,
      description: values.description || undefined,
      opponent_name: opponentTeamId ? undefined : (opponentTeamName || values.opponentName),
      opponent_logo_url: opponentLogoUrl || undefined,
      home_away: values.homeAway,
      location: locationString,
      location_type: locationString ? 'physical' : 'tbd',
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      max_participants: values.maxParticipants ? parseInt(values.maxParticipants) : undefined,
      is_public: !homeTeamId,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Teams section */}
        <div className="space-y-3 p-4 rounded-lg bg-muted/30 border">
          <h4 className="text-sm font-medium text-muted-foreground">{lang === 'fr' ? 'Équipes' : 'Teams'}</h4>
          
          {/* Sport selector inside teams section */}
          {!teamId && (
            <SportQuickSelector
              value={selectedSport}
              onChange={setSelectedSport}
              label={t('form.sport')}
              lang={lang}
              required
            />
          )}

          {/* Home Team */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('form.game.yourTeam')}</label>
            {teamId && homeTeam ? (
              <div className="flex items-center gap-3 p-2 bg-background rounded-md border">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-primary/10">
                    {homeTeam.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium flex-1">{homeTeam.name}</span>
                <Badge variant="outline" className="text-xs">
                  <Home className="h-3 w-3 mr-1" />
                  {t('form.game.home')}
                </Badge>
              </div>
            ) : (
              <MyTeamSelector
                value={homeTeamId}
                onChange={(id) => setHomeTeamId(id)}
                sportFilter={selectedSport || undefined}
                placeholder={!selectedSport && !teamId ? (lang === 'fr' ? 'Sélectionnez un sport d\'abord' : 'Select a sport first') : t('form.game.selectTeam')}
                optional={false}
                disabled={!selectedSport && !teamId}
              />
            )}
          </div>

          {/* Opponent */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('form.game.opponentTeam')}</label>
              <div className="flex gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant={useTeamSelector ? "default" : "ghost"}
                  onClick={() => setUseTeamSelector(true)}
                  className="h-6 px-2 text-xs"
                >
                  {t('form.game.selectTeam')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={!useTeamSelector ? "default" : "ghost"}
                  onClick={() => setUseTeamSelector(false)}
                  className="h-6 px-2 text-xs"
                >
                  {t('form.game.enterManually')}
                </Button>
              </div>
            </div>

            {useTeamSelector ? (
              <TeamSelector
                onSelect={(id, name, logo) => {
                  setOpponentTeamId(id);
                  setOpponentTeamName(name);
                  setOpponentLogoUrl(logo || "");
                  form.setValue("opponentName", name);
                }}
                selectedTeamId={opponentTeamId || undefined}
                excludeTeamId={homeTeamId || undefined}
                placeholder={!effectiveSport ? (lang === 'fr' ? 'Sélectionnez un sport d\'abord' : 'Select a sport first') : (lang === 'fr' ? 'Rechercher...' : 'Search...')}
                sportFilter={effectiveSport || undefined}
                showCreateButton={true}
              />
            ) : (
              <Input 
                placeholder={t('form.game.opponentPlaceholder')}
                value={opponentTeamName}
                onChange={(e) => {
                  setOpponentTeamName(e.target.value);
                  form.setValue("opponentName", e.target.value);
                }}
              />
            )}
          </div>
        </div>

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.game.title')}</FormLabel>
              <FormControl>
                <Input placeholder={t('form.game.titlePlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Where section */}
        <div className="space-y-3 p-4 rounded-lg bg-muted/30 border">
          <h4 className="text-sm font-medium text-muted-foreground">{lang === 'fr' ? 'Lieu' : 'Where'}</h4>
          
          {/* Home/Away toggle */}
          <FormField
            control={form.control}
            name="homeAway"
            render={({ field }) => (
              <FormItem>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant={field.value === 'home' ? "default" : "outline"}
                    onClick={() => field.onChange('home')}
                    className="flex-1 h-9"
                  >
                    <Home className="h-3.5 w-3.5 mr-1" />
                    {t('form.game.home')}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={field.value === 'away' ? "default" : "outline"}
                    onClick={() => field.onChange('away')}
                    className="flex-1 h-9"
                  >
                    <Plane className="h-3.5 w-3.5 mr-1" />
                    {t('form.game.away')}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={field.value === 'neutral' ? "default" : "outline"}
                    onClick={() => field.onChange('neutral')}
                    className="flex-1 h-9"
                  >
                    <Scale className="h-3.5 w-3.5 mr-1" />
                    {t('form.game.neutral')}
                  </Button>
                </div>
              </FormItem>
            )}
          />

          {/* Venue */}
          <DistrictSelector
            value={location}
            onChange={setLocation}
            label={t('form.game.venue')}
            venueLabel={lang === 'fr' ? 'Nom du stade' : 'Stadium name'}
            venuePlaceholder={t('form.game.venuePlaceholder')}
          />
        </div>

        {/* When section */}
        <div className="space-y-4 p-4 rounded-lg bg-muted/30 border">
          <h4 className="text-sm font-medium text-muted-foreground">{lang === 'fr' ? 'Quand' : 'When'}</h4>
          
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('form.date')}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? format(field.value, "PPP") : <span>{t('form.pickDate')}</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{sportDefaults.timeLabel[lang]}</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DurationPicker
              value={duration}
              onChange={setDuration}
              label={t('form.duration')}
              presets={[60, 90, 120]}
            />
          </div>
        </div>

        {/* Details section */}
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="maxParticipants"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.game.players')}</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    placeholder={String(sportDefaults.players)}
                    className="h-10"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.descriptionOptional')}</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={lang === 'fr' ? 'Détails supplémentaires' : 'Additional details'} 
                  className="resize-none h-16" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            {t('actions.cancel', { ns: 'common' })}
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? t('actions.loading', { ns: 'common' }) : t('form.game.create')}
          </Button>
        </div>
      </form>
    </Form>
  );
};