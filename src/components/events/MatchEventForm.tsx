import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CreateEventData } from "@/hooks/useEvents";
import { TeamSelector } from "@/components/teams/TeamSelector";
import { useTeam } from "@/hooks/useTeam";
import { DistrictSelector } from "@/components/location/DistrictSelector";
import { getDistrictLabel } from "@/lib/parisDistricts";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  homeTeamId: z.string().optional(),
  opponentTeamId: z.string().optional(),
  opponentName: z.string().max(100).optional(),
  opponentLogoUrl: z.string().url().optional().or(z.literal("")),
  homeAway: z.enum(['home', 'away', 'neutral']),
  matchFormat: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  date: z.date({ required_error: "Date is required" }),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
}).refine(
  (data) => data.opponentTeamId || data.opponentName,
  { 
    message: "Select opponent team or enter name manually",
    path: ["opponentTeamId"]
  }
);

type FormData = z.infer<typeof formSchema>;

interface MatchEventFormProps {
  teamId?: string;
  onSubmit: (data: CreateEventData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const MatchEventForm = ({ teamId, onSubmit, onCancel, isSubmitting }: MatchEventFormProps) => {
  const { i18n, t } = useTranslation();
  const lang = (i18n.language?.split('-')[0] || 'fr') as 'en' | 'fr';
  const [useTeamSelector, setUseTeamSelector] = useState(true);
  const [homeTeamId, setHomeTeamId] = useState<string | undefined>(teamId);
  const [opponentTeamId, setOpponentTeamId] = useState<string | null>(null);
  const [opponentTeamName, setOpponentTeamName] = useState<string>("");
  const [opponentLogoUrl, setOpponentLogoUrl] = useState<string>("");
  const [location, setLocation] = useState<{ district: string; venueName?: string }>({ district: '', venueName: '' });
  
  const { team: homeTeam } = useTeam(teamId);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      homeTeamId: teamId || undefined,
      opponentTeamId: undefined,
      opponentName: "",
      opponentLogoUrl: "",
      homeAway: 'home',
      matchFormat: "",
      description: "",
      startTime: "15:00",
      endTime: "17:00",
    },
  });

  const handleSubmit = (values: FormData) => {
    const startDateTime = new Date(values.date);
    const [startHour, startMinute] = values.startTime.split(':');
    startDateTime.setHours(parseInt(startHour), parseInt(startMinute));

    const endDateTime = new Date(values.date);
    const [endHour, endMinute] = values.endTime.split(':');
    endDateTime.setHours(parseInt(endHour), parseInt(endMinute));

    const locationString = location.district 
      ? `${getDistrictLabel(location.district, lang)}${location.venueName ? ` - ${location.venueName}` : ''}`
      : undefined;

    onSubmit({
      team_id: homeTeamId || null,
      opponent_team_id: opponentTeamId || null,
      type: 'match',
      title: values.title,
      description: values.description || undefined,
      opponent_name: opponentTeamId ? undefined : (opponentTeamName || values.opponentName),
      opponent_logo_url: opponentLogoUrl || values.opponentLogoUrl || undefined,
      home_away: values.homeAway,
      match_format: values.matchFormat || undefined,
      location: locationString,
      location_type: locationString ? 'physical' : 'tbd',
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      is_public: !homeTeamId,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{lang === 'fr' ? 'Titre du match' : 'Match Title'}</FormLabel>
              <FormControl>
                <Input placeholder={lang === 'fr' ? 'ex: Finale du championnat' : 'e.g., Championship Final'} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Home Team Selection */}
        <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">{lang === 'fr' ? 'Votre équipe (Domicile)' : 'Your Team (Home)'}</h3>
            {homeTeamId && <Badge variant="secondary">✓ {lang === 'fr' ? 'Sélectionné' : 'Selected'}</Badge>}
          </div>
          
          {teamId && homeTeam ? (
            <div className="flex items-center gap-2 p-2 bg-background rounded border">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                {homeTeam.name.substring(0, 2).toUpperCase()}
              </div>
              <span className="text-sm font-medium">{homeTeam.name}</span>
            </div>
          ) : (
            <>
              <TeamSelector
                onSelect={(id, name, logo) => {
                  setHomeTeamId(id);
                  form.setValue("homeTeamId", id);
                }}
                selectedTeamId={homeTeamId}
                placeholder={lang === 'fr' ? 'Sélectionner votre équipe' : 'Select your team'}
                label={lang === 'fr' ? 'Pour quelle équipe organisez-vous ce match ?' : 'Which team are you organizing this match for?'}
                showCreateButton={true}
              />
              {!homeTeamId && (
                <p className="text-xs text-muted-foreground">
                  💡 {lang === 'fr' ? 'Créer une équipe aide à organiser les matchs et développer votre communauté !' : 'Creating a team helps organize matches and grow your community!'}
                </p>
              )}
            </>
          )}
        </div>

        {/* Opponent Team Selection */}
        <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">{lang === 'fr' ? 'Équipe adverse' : 'Opponent Team'}</h3>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={useTeamSelector ? "default" : "outline"}
                onClick={() => setUseTeamSelector(true)}
              >
                {lang === 'fr' ? 'Sélectionner' : 'Select Team'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={!useTeamSelector ? "default" : "outline"}
                onClick={() => setUseTeamSelector(false)}
              >
                {lang === 'fr' ? 'Saisir' : 'Enter Manually'}
              </Button>
            </div>
          </div>

          {useTeamSelector ? (
            <div className="space-y-2">
              <TeamSelector
                onSelect={(id, name, logo) => {
                  setOpponentTeamId(id);
                  setOpponentTeamName(name);
                  setOpponentLogoUrl(logo || "");
                  form.setValue("opponentTeamId", id);
                  form.setValue("opponentName", name);
                }}
                selectedTeamId={opponentTeamId || undefined}
                excludeTeamId={homeTeamId}
                placeholder={lang === 'fr' ? 'Rechercher équipes adverses...' : 'Search opponent teams...'}
                label={lang === 'fr' ? 'Sélectionner une équipe existante' : 'Select opponent from existing teams'}
                sportFilter={homeTeam?.sport || undefined}
                showCreateButton={true}
              />
              <p className="text-xs text-muted-foreground">
                🎯 {lang === 'fr' ? 'Recommandé : Sélectionner une équipe pour notifier ses membres et suivre les matchs' : 'Recommended: Select a team to notify their members and track matches'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="opponentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{lang === 'fr' ? "Nom de l'adversaire" : 'Opponent Name'}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={lang === 'fr' ? 'ex: FC City Rivals' : 'e.g., City Rivals FC'} 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setOpponentTeamName(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-xs text-muted-foreground">
                💡 {lang === 'fr' ? 'Aidez-les à créer un compte équipe pour rejoindre votre match !' : 'Help them create a team account to join your match!'}
              </p>
            </div>
          )}
        </div>

        <FormField
          control={form.control}
          name="homeAway"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{lang === 'fr' ? 'Lieu du match' : 'Match Location'}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="home">{lang === 'fr' ? 'Domicile' : 'Home'}</SelectItem>
                  <SelectItem value="away">{lang === 'fr' ? 'Extérieur' : 'Away'}</SelectItem>
                  <SelectItem value="neutral">{lang === 'fr' ? 'Terrain neutre' : 'Neutral Venue'}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="matchFormat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{lang === 'fr' ? 'Format du match (optionnel)' : 'Match Format (Optional)'}</FormLabel>
              <FormControl>
                <Input placeholder={lang === 'fr' ? 'ex: 11v11, 5v5, Best of 3' : 'e.g., 11v11, 5v5, Best of 3'} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{lang === 'fr' ? 'Description (optionnel)' : 'Description (Optional)'}</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={lang === 'fr' ? 'Détails supplémentaires du match' : 'Additional match details'} 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{lang === 'fr' ? 'Date' : 'Date'}</FormLabel>
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
                      {field.value ? format(field.value, "PPP") : <span>{lang === 'fr' ? 'Choisir une date' : 'Pick a date'}</span>}
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
                <FormLabel>{lang === 'fr' ? 'Coup d\'envoi' : 'Kickoff Time'}</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{lang === 'fr' ? 'Heure de fin' : 'End Time'}</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Location - District Selector */}
        <DistrictSelector
          value={location}
          onChange={setLocation}
          label={lang === 'fr' ? 'Stade/Terrain (optionnel)' : 'Venue (Optional)'}
          venueLabel={lang === 'fr' ? 'Nom du stade' : 'Stadium name'}
          venuePlaceholder={lang === 'fr' ? 'ex: Stade Central' : 'e.g., Central Stadium'}
        />

        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            {t('actions.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? t('actions.loading') : (lang === 'fr' ? 'Créer le match' : 'Create Match')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
