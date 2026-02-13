import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, subHours } from "date-fns";
import { AnimatePresence, motion, Easing } from "framer-motion";
import { CalendarIcon, Globe, Lock, Link2, MapPin, Video, Repeat, Users, UserPlus, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { EventType } from "@/lib/eventConfig";
import { CreateEventData } from "@/hooks/useEvents";

import { EventTypeSelector } from "./EventTypeSelector";
import { DurationPicker } from "./DurationPicker";
import { SportQuickSelector } from "./SportQuickSelector";
import { DistrictSelector } from "@/components/location/DistrictSelector";
import { MyTeamSelector } from "@/components/teams/MyTeamSelector";
import { TeamSelector } from "@/components/teams/TeamSelector";

// Recurrence types
type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

// RSVP Deadline presets
type DeadlinePreset = '1h' | '3h' | '24h' | '48h' | '1week' | 'custom';

const DEADLINE_PRESETS: { value: DeadlinePreset; hours: number }[] = [
  { value: '1h', hours: 1 },
  { value: '3h', hours: 3 },
  { value: '24h', hours: 24 },
  { value: '48h', hours: 48 },
  { value: '1week', hours: 168 },
  { value: 'custom', hours: 0 },
];

// Meetup categories
const MEETUP_CATEGORIES = [
  { value: 'watch_party', emoji: '📺' },
  { value: 'post_game', emoji: '🍻' },
  { value: 'team_dinner', emoji: '🍽️' },
  { value: 'social', emoji: '🎉' },
  { value: 'fitness', emoji: '💪' },
  { value: 'other', emoji: '📋' },
];

// Default durations by event type
const DEFAULT_DURATIONS: Record<EventType, number> = {
  training: 90,
  meetup: 120,
  match: 90,
};

// Form schema
const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  date: z.date({ required_error: "Date is required" }),
  startTime: z.string().min(1, "Start time is required"),
  location: z.string().min(1, "Location is required"),
  maxParticipants: z.string().optional(),
  opponentName: z.string().optional(),
  matchFormat: z.string().optional(),
  category: z.string().optional(),
  locationUrl: z.string().url().optional().or(z.literal('')),
  isPublic: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface UnifiedEventFormProps {
  teamId?: string;
  sport?: string;
  defaultType?: EventType;
  onSubmit: (data: CreateEventData) => Promise<boolean>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const fieldVariants = {
  hidden: { 
    opacity: 0, 
    height: 0, 
    marginBottom: 0,
    overflow: 'hidden' as const,
  },
  visible: { 
    opacity: 1, 
    height: 'auto' as const, 
    marginBottom: 12,
    overflow: 'visible' as const,
  },
};

const transitionConfig = { 
  duration: 0.2, 
  ease: [0.4, 0, 0.2, 1] as Easing 
};

export const UnifiedEventForm = ({
  teamId,
  sport: initialSport,
  defaultType = 'training',
  onSubmit,
  onCancel,
  isSubmitting = false,
}: UnifiedEventFormProps) => {
  const { t, i18n } = useTranslation('events');
  const lang = (i18n.language?.split('-')[0] || 'en') as 'en' | 'fr';
  
  // Event type state
  const [eventType, setEventType] = useState<EventType>(defaultType);
  
  // Shared states
  const [selectedSport, setSelectedSport] = useState(initialSport || '');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(teamId || null);
  const [selectedTeamName, setSelectedTeamName] = useState<string>('');
  const [selectedTeamSport, setSelectedTeamSport] = useState<string | undefined>(undefined);
  const [duration, setDuration] = useState(DEFAULT_DURATIONS[defaultType]);
  const [locationValue, setLocationValue] = useState<{ district: string; venueName?: string }>({ district: '' });
  
  // Match-specific states
  const [homeAway, setHomeAway] = useState<'home' | 'away' | 'neutral'>('home');
  const [opponentTeamId, setOpponentTeamId] = useState<string | null>(null);
  const [opponentTeamName, setOpponentTeamName] = useState<string>('');
  const [opponentInputMode, setOpponentInputMode] = useState<'select' | 'manual'>('select');
  
  // Meetup-specific states
  const [locationMode, setLocationMode] = useState<'physical' | 'virtual' | 'hybrid'>('physical');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Recurrence states
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('none');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | undefined>(undefined);

  // Description toggle (tap to expand pattern)
  const [showDescription, setShowDescription] = useState(false);
  
  // RSVP Deadline state
  const [showRsvpDeadline, setShowRsvpDeadline] = useState(false);
  const [deadlinePreset, setDeadlinePreset] = useState<DeadlinePreset>('24h');
  const [customDeadline, setCustomDeadline] = useState<Date | undefined>(undefined);
  
  // Looking for Players state (for match and training)
  const [lookingForPlayers, setLookingForPlayers] = useState(false);
  const [playersNeeded, setPlayersNeeded] = useState("4");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      startTime: '19:00',
      location: '',
      maxParticipants: '',
      opponentName: '',
      matchFormat: '',
      category: '',
      locationUrl: '',
      isPublic: !teamId,
    },
  });

  const watchedTitle = form.watch('title');
  const watchedDate = form.watch('date');
  const watchedStartTime = form.watch('startTime');
  const watchedMaxParticipants = form.watch('maxParticipants');
  const watchedOpponentName = form.watch('opponentName');

  // Update duration when event type changes
  useEffect(() => {
    setDuration(DEFAULT_DURATIONS[eventType]);
  }, [eventType]);

  // Reset opponent when sport changes
  useEffect(() => {
    if (eventType === 'match') {
      setOpponentTeamId(null);
      setOpponentTeamName('');
      form.setValue('opponentName', '');
    }
  }, [selectedSport, eventType, form]);

  // Auto-generate title for matches
  useEffect(() => {
    if (eventType === 'match' && selectedTeamName) {
      const opponent = opponentInputMode === 'select' ? opponentTeamName : form.getValues('opponentName');
      if (opponent) {
        const title = homeAway === 'home' 
          ? `${selectedTeamName} vs ${opponent}`
          : `${opponent} vs ${selectedTeamName}`;
        form.setValue('title', title);
      }
    }
  }, [selectedTeamName, opponentTeamName, homeAway, opponentInputMode, eventType, form]);

  // Handle team selection from MyTeamSelector
  const handleTeamSelect = (teamId: string | null, teamName?: string) => {
    setSelectedTeamId(teamId);
    setSelectedTeamName(teamName || '');
  };

  // Handle opponent selection from TeamSelector
  const handleOpponentSelect = (teamId: string, teamName: string) => {
    setOpponentTeamId(teamId);
    setOpponentTeamName(teamName);
  };

  // Get category label
  const getCategoryLabel = (value: string) => {
    const categoryMap: Record<string, string> = {
      watch_party: t('categories.watchParty'),
      post_game: t('categories.postGame'),
      team_dinner: t('categories.teamDinner'),
      social: t('categories.social'),
      fitness: t('categories.fitness'),
      other: t('categories.other'),
    };
    return categoryMap[value] || value;
  };

  // Generate RRULE string from recurrence settings
  const generateRecurrenceRule = (): string | undefined => {
    if (!isRecurring || recurrenceType === 'none') return undefined;
    
    const freqMap: Record<RecurrenceType, string> = {
      none: '',
      daily: 'DAILY',
      weekly: 'WEEKLY',
      monthly: 'MONTHLY',
      yearly: 'YEARLY'
    };
    
    let rule = `FREQ=${freqMap[recurrenceType]}`;
    if (recurrenceEndDate) {
      rule += `;UNTIL=${format(recurrenceEndDate, "yyyyMMdd'T'235959'Z'")}`;
    }
    return rule;
  };

  const handleSubmit = async (values: FormData) => {
    const [hours, minutes] = values.startTime.split(':').map(Number);
    const startDate = new Date(values.date);
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

    // Determine location type for meetups
    let locationType: 'physical' | 'virtual' | 'tbd' = 'physical';
    if (eventType === 'meetup') {
      if (locationMode === 'virtual') locationType = 'virtual';
      else if (locationMode === 'hybrid') locationType = 'physical';
    }

    const eventData: CreateEventData = {
      type: eventType,
      title: values.title,
      description: values.description || undefined,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      location: locationValue.venueName || undefined,
      location_type: locationType,
      location_url: eventType === 'meetup' && values.locationUrl ? values.locationUrl : undefined,
      max_participants: values.maxParticipants ? parseInt(values.maxParticipants, 10) : undefined,
      is_public: isPickupGame ? true : (values.isPublic ?? !(selectedTeamId || teamId)),
      team_id: selectedTeamId || teamId || undefined,
      sport: selectedSport || undefined,
      opponent_name: eventType === 'match' 
        ? (opponentInputMode === 'select' ? opponentTeamName : values.opponentName) || undefined
        : undefined,
      opponent_team_id: eventType === 'match' && opponentInputMode === 'select' ? opponentTeamId || undefined : undefined,
      home_away: eventType === 'match' ? homeAway : undefined,
      match_format: eventType === 'match' ? values.matchFormat || undefined : undefined,
      meetup_category: eventType === 'meetup' ? selectedCategory || undefined : undefined,
      looking_for_players: showLookingForPlayersSection ? lookingForPlayers : undefined,
      players_needed: showLookingForPlayersSection && lookingForPlayers ? parseInt(playersNeeded, 10) : undefined,
      is_recurring: isRecurring,
      recurrence_rule: generateRecurrenceRule(),
      rsvp_deadline: showRsvpDeadline ? calculateRsvpDeadline(startDate)?.toISOString() : undefined,
    };

    await onSubmit(eventData);
  };
  
  // Calculate RSVP deadline based on preset or custom date
  const calculateRsvpDeadline = (eventDateTime: Date): Date | null => {
    if (!showRsvpDeadline) return null;
    if (deadlinePreset === 'custom') return customDeadline || null;
    const preset = DEADLINE_PRESETS.find(p => p.value === deadlinePreset);
    if (!preset || preset.hours === 0) return null;
    return subHours(eventDateTime, preset.hours);
  };

  // Detect pickup game mode - match type without team selected
  const isPickupGame = eventType === 'match' && !selectedTeamId && !teamId;

  // Visibility conditions
  const showSportSelector = !teamId && (eventType === 'match' || eventType === 'training');
  const showTeamSelector = !teamId && (eventType === 'match' || eventType === 'training');
  const showOpponentSection = eventType === 'match' && !isPickupGame;
  const showHomeAwayToggle = eventType === 'match' && !isPickupGame;
  const showMatchFormat = eventType === 'match';
  const showCategorySelector = eventType === 'meetup';
  const showLocationMode = eventType === 'meetup';
  const showVirtualLink = eventType === 'meetup' && (locationMode === 'virtual' || locationMode === 'hybrid');
  const showLookingForPlayersSection = eventType === 'match' || eventType === 'training';
  
  const isPublicEvent = isPickupGame || form.watch('isPublic');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3 min-w-0 overflow-hidden">
        {/* ── Section 1: Essentials ── */}
        
        {/* 1a. Event Type */}
        <EventTypeSelector value={eventType} onChange={setEventType} />

        <div className="space-y-3" aria-live="polite">
          {/* 1b. Sport Selector (before title so match titles auto-generate) */}
          <AnimatePresence mode="sync">
            {showSportSelector && (
              <motion.div key="sport-selector" variants={fieldVariants} initial="hidden" animate="visible" exit="hidden" transition={transitionConfig}>
                <SportQuickSelector
                  value={selectedSport || null}
                  onChange={(sport) => {
                    setSelectedSport(sport);
                    setSelectedTeamId(null);
                    setSelectedTeamName('');
                  }}
                  label={t('form.sport')}
                  lang={lang}
                />
              </motion.div>
            )}

            {/* 1c. Team Selector */}
            {showTeamSelector && (
              <motion.div key="team-selector" variants={fieldVariants} initial="hidden" animate="visible" exit="hidden" transition={transitionConfig}>
                <MyTeamSelector
                  value={selectedTeamId}
                  onChange={handleTeamSelect}
                  sportFilter={selectedSport || undefined}
                  label={eventType === 'match' ? t('form.game.yourTeam') : t('details.team')}
                  placeholder={eventType === 'match' ? t('form.game.pickupOrTeam') : t('form.game.selectTeam')}
                  forEventCreation={true}
                  showCreateButton={true}
                  showPickupOption={eventType === 'match'}
                  onTeamCreated={(teamId, teamName) => {
                    setSelectedTeamId(teamId);
                    setSelectedTeamName(teamName);
                  }}
                />
                
                {eventType === 'match' && (
                  <div className="flex items-center gap-1.5 text-[10px] mt-1.5">
                    {isPickupGame ? (
                      <>
                        <Globe className="h-3 w-3 text-accent-foreground" />
                        <span className="text-muted-foreground">{t('form.visibility.public')}</span>
                      </>
                    ) : selectedTeamId ? (
                      <>
                        <Lock className="h-3 w-3 text-warning" />
                        <span className="text-muted-foreground">{t('form.visibility.teamOnly')}</span>
                      </>
                    ) : null}
                  </div>
                )}
              </motion.div>
            )}

            {/* 1d. Meetup Category (right after type for meetups) */}
            {showCategorySelector && (
              <motion.div key="category-selector" variants={fieldVariants} initial="hidden" animate="visible" exit="hidden" transition={transitionConfig}>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('form.meetup.category')}</Label>
                  <div className="grid grid-cols-2 min-[360px]:grid-cols-3 gap-1.5">
                    {MEETUP_CATEGORIES.map(({ value, emoji }) => (
                      <Button
                        key={value}
                        type="button"
                        variant={selectedCategory === value ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory(value)}
                        className="h-9 flex flex-col items-center gap-0 text-xs overflow-hidden px-1"
                      >
                        <span className="text-sm leading-none">{emoji}</span>
                        <span className="truncate w-full text-center leading-tight">{getCategoryLabel(value)}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 1e. Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">{t('form.title')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="h-9"
                    placeholder={
                      eventType === 'match'
                        ? t('form.game.titlePlaceholder')
                        : eventType === 'meetup'
                        ? t('form.meetup.titlePlaceholder')
                        : t('form.training.titlePlaceholder')
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 1f. When — Date, Time, Duration (no card wrapper) */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">{t('details.when')}</Label>
            
            <div className="grid grid-cols-2 gap-2">
              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col min-w-0">
                    <FormLabel className="text-xs text-muted-foreground">{t('form.date')}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "h-9 pl-2.5 text-left font-normal w-full min-w-0 text-xs",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <span className="truncate flex-1">
                              {field.value ? format(field.value, "MMM dd") : t('form.pickDate')}
                            </span>
                            <CalendarIcon className="ml-1.5 h-3.5 w-3.5 opacity-50 shrink-0" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Time */}
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem className="min-w-0">
                    <FormLabel className="text-xs text-muted-foreground">{t('form.startTime')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="time" className="h-9 text-xs" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Duration */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{t('form.duration')}</Label>
              <DurationPicker value={duration} onChange={setDuration} />
            </div>
          </div>

          {/* 1g. Where (no card wrapper) */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">{t('details.where')}</Label>

            {/* Location Mode Toggle - Meetup only */}
            {showLocationMode && (
              <div className="grid grid-cols-3 gap-1.5">
                {([
                  { mode: 'physical' as const, icon: MapPin },
                  { mode: 'virtual' as const, icon: Video },
                  { mode: 'hybrid' as const, icon: Link2 },
                ]).map(({ mode, icon: Icon }) => (
                  <Button
                    key={mode}
                    type="button"
                    variant={locationMode === mode ? 'default' : 'outline'}
                    onClick={() => setLocationMode(mode)}
                    className="h-8 gap-1 overflow-hidden"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-xs truncate">{t(`form.locationMode.${mode}`)}</span>
                  </Button>
                ))}
              </div>
            )}

            {/* Physical Location */}
            {(locationMode !== 'virtual' || eventType !== 'meetup') && (
              <FormField
                control={form.control}
                name="location"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <DistrictSelector
                      value={locationValue}
                      onChange={(val) => {
                        setLocationValue(val);
                        field.onChange(val.venueName || '');
                      }}
                      placeholder={t('form.locationPlaceholder')}
                    />
                    {fieldState.error && (
                      <FormMessage>{t('form.locationRequired')}</FormMessage>
                    )}
                  </FormItem>
                )}
              />
            )}

            {/* Virtual Link */}
            {showVirtualLink && (
              <FormField
                control={form.control}
                name="locationUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">{t('form.meetup.virtualLink')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="url" placeholder="https://zoom.us/j/..." className="h-9 text-xs" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* 1h. Visibility Toggle (promoted to essentials) */}
          <FormField
            control={form.control}
            name="isPublic"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    {field.value ? <Globe className="h-3.5 w-3.5 text-primary" /> : <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                    <div>
                      <p className="text-xs font-medium">
                        {field.value ? t('form.isPublic') : t('form.isPrivate', 'Private Event')}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {field.value ? t('form.isPublicDesc') : t('form.isPrivateDesc', 'Only invited members can see this')}
                      </p>
                    </div>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />

          {/* ── Section 2: Match Details (single card, match-only) ── */}
          <AnimatePresence mode="sync">
            {showOpponentSection && (
              <motion.div key="match-details-card" variants={fieldVariants} initial="hidden" animate="visible" exit="hidden" transition={transitionConfig}>
                <div className="space-y-3 p-3 bg-muted/30 rounded-lg border">
                  {/* Opponent */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">{t('form.game.opponentTeam')}</Label>
                    
                    <div className="flex gap-1.5">
                      <Button type="button" size="sm" variant={opponentInputMode === 'select' ? 'default' : 'outline'} onClick={() => setOpponentInputMode('select')} className="flex-1 overflow-hidden h-7">
                        <span className="text-xs truncate">{t('form.game.selectTeam')}</span>
                      </Button>
                      <Button type="button" size="sm" variant={opponentInputMode === 'manual' ? 'default' : 'outline'} onClick={() => setOpponentInputMode('manual')} className="flex-1 overflow-hidden h-7">
                        <span className="text-xs truncate">{t('form.game.enterManually')}</span>
                      </Button>
                    </div>

                    {opponentInputMode === 'select' ? (
                      <TeamSelector
                        onSelect={handleOpponentSelect}
                        selectedTeamId={opponentTeamId || undefined}
                        sportFilter={selectedSport || selectedTeamSport}
                        excludeTeamId={selectedTeamId || undefined}
                        placeholder={t('form.game.opponentPlaceholder')}
                      />
                    ) : (
                      <FormField
                        control={form.control}
                        name="opponentName"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} placeholder={t('form.game.opponentPlaceholder')} className="h-9 text-xs" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  {/* Home/Away */}
                  {showHomeAwayToggle && (
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t('form.game.location')}</Label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['home', 'away', 'neutral'] as const).map((option) => (
                          <Button
                            key={option}
                            type="button"
                            variant={homeAway === option ? 'default' : 'outline'}
                            onClick={() => setHomeAway(option)}
                            className="h-8 text-xs overflow-hidden"
                          >
                            {option === 'home' ? '🏠' : option === 'away' ? '✈️' : '⚖️'}{' '}
                            <span className="truncate">{t(`form.game.${option}`)}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Match Format (moved here from participant section) */}
                  {showMatchFormat && (
                    <FormField
                      control={form.control}
                      name="matchFormat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">{t('form.game.format')}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={t('form.game.formatPlaceholder')} className="h-9 text-xs" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Section 3: Options (all inline, no collapsible) ── */}
          <Separator className="my-1" />

          {/* Description - tap to expand */}
          {!showDescription ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowDescription(true)}
              className="w-full justify-start h-8 text-xs text-muted-foreground px-0 hover:text-foreground"
            >
              + {t('form.addNote', 'Add a note...')}
            </Button>
          ) : (
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t('form.descriptionPlaceholder')}
                      className="min-h-[48px] resize-none text-xs"
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Participants - inline row */}
          <FormField
            control={form.control}
            name="maxParticipants"
            render={({ field }) => (
              <div className="flex items-center justify-between h-9">
                <Label className="text-xs flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  {t('form.maxParticipants')}
                </Label>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="2"
                    max="100"
                    placeholder="--"
                    className="w-20 h-8 text-xs text-right"
                  />
                </FormControl>
              </div>
            )}
          />

          {/* Recurrence - inline row */}
          <div className="flex items-center justify-between h-9">
            <Label className="text-xs flex items-center gap-1.5">
              <Repeat className="h-3.5 w-3.5 text-muted-foreground" />
              {t('form.repeat')}
            </Label>
            <Select
              value={recurrenceType}
              onValueChange={(value: RecurrenceType) => {
                setRecurrenceType(value);
                setIsRecurring(value !== 'none');
              }}
            >
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue placeholder={t('form.recurrence.selectFrequency')} />
              </SelectTrigger>
              <SelectContent>
                {(['none', 'daily', 'weekly', 'monthly'] as RecurrenceType[]).map((type) => (
                  <SelectItem key={type} value={type}>{t(`form.recurrence.${type}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recurrence end date (only when recurring) */}
          {isRecurring && (
            <div className="pl-5 space-y-1">
              <Label className="text-[10px] text-muted-foreground">{t('form.recurrence.until')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full h-8 justify-start text-left font-normal min-w-0 text-xs">
                    <span className="truncate flex-1">
                      {recurrenceEndDate ? format(recurrenceEndDate, "MMM dd, yyyy") : t('form.recurrence.noEndDate')}
                    </span>
                    <CalendarIcon className="ml-1.5 h-3.5 w-3.5 opacity-50 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={recurrenceEndDate} onSelect={setRecurrenceEndDate} disabled={(date) => { const today = new Date(); today.setHours(0, 0, 0, 0); return date < today; }} className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* RSVP Deadline - inline switch */}
          <div className="space-y-2">
            <div className="flex items-center justify-between h-9">
              <Label className="text-xs flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                {t('form.rsvpDeadline')}
              </Label>
              <Switch checked={showRsvpDeadline} onCheckedChange={setShowRsvpDeadline} />
            </div>

            {showRsvpDeadline && (
              <div className="space-y-2 pl-5">
                <div className="flex flex-wrap gap-1.5">
                  {DEADLINE_PRESETS.map((preset) => (
                    <Button key={preset.value} type="button" variant={deadlinePreset === preset.value ? 'default' : 'outline'} size="sm" onClick={() => setDeadlinePreset(preset.value)} className="h-7 text-xs px-2">
                      {t(`form.deadline.${preset.value}`)}
                    </Button>
                  ))}
                </div>

                {deadlinePreset === 'custom' && (
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" className="flex-1 h-8 justify-start text-left font-normal text-xs">
                          <CalendarIcon className="mr-1.5 h-3.5 w-3.5 opacity-50" />
                          {customDeadline ? format(customDeadline, "MMM dd, yyyy") : t('form.pickDate')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={customDeadline}
                          onSelect={(date) => {
                            if (date) {
                              const newDate = new Date(date);
                              if (customDeadline) {
                                newDate.setHours(customDeadline.getHours(), customDeadline.getMinutes());
                              } else {
                                newDate.setHours(18, 0);
                              }
                              setCustomDeadline(newDate);
                            }
                          }}
                          disabled={(date) => { const today = new Date(); today.setHours(0, 0, 0, 0); return date < today; }}
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <Input
                      type="time"
                      value={customDeadline ? format(customDeadline, 'HH:mm') : '18:00'}
                      onChange={(e) => {
                        const [hours, mins] = e.target.value.split(':').map(Number);
                        const newDate = customDeadline ? new Date(customDeadline) : new Date();
                        newDate.setHours(hours, mins);
                        setCustomDeadline(newDate);
                      }}
                      className="w-20 h-8 text-xs"
                    />
                  </div>
                )}

                {watchedDate && watchedStartTime && (
                  <p className="text-[10px] text-primary">
                    {(() => {
                      const [hours, minutes] = watchedStartTime.split(':').map(Number);
                      const eventDateTime = new Date(watchedDate);
                      eventDateTime.setHours(hours, minutes, 0, 0);
                      const deadline = calculateRsvpDeadline(eventDateTime);
                      if (deadline) return t('form.deadlinePreview', { time: format(deadline, 'EEE MMM d, HH:mm') });
                      return null;
                    })()}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Looking for Players - inline switch (match/training only) */}
          {showLookingForPlayersSection && (
            <div className="space-y-2">
              <div className="flex items-center justify-between h-9">
                <Label className="text-xs flex items-center gap-1.5">
                  <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
                  {t('lookingForPlayers.title')}
                </Label>
                <Switch checked={lookingForPlayers} onCheckedChange={setLookingForPlayers} />
              </div>

              {lookingForPlayers && (
                <div className="pl-5">
                  <Select value={playersNeeded} onValueChange={setPlayersNeeded}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? t('lookingForPlayers.player', { defaultValue: 'player' }) : t('lookingForPlayers.players', { defaultValue: 'players' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* ── Submit (single full-width button, no cancel) ── */}
          <Button type="submit" className="w-full h-10" disabled={isSubmitting}>
            {isSubmitting ? '...' : t('createEvent')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
