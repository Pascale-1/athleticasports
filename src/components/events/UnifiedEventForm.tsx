import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { AnimatePresence, motion, Easing } from "framer-motion";
import { CalendarIcon, Globe, Lock, Link2, MapPin, Video, Repeat, Plus, Users, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import { EventType } from "@/lib/eventConfig";
import { CreateEventData } from "@/hooks/useEvents";

import { EventTypeSelector } from "./EventTypeSelector";
import { EventPreviewCard } from "./EventPreviewCard";
import { DurationPicker } from "./DurationPicker";
import { SportQuickSelector } from "./SportQuickSelector";
import { DistrictSelector } from "@/components/location/DistrictSelector";
import { MyTeamSelector } from "@/components/teams/MyTeamSelector";
import { TeamSelector } from "@/components/teams/TeamSelector";

// Recurrence types
type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

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
  maxParticipants: z.string().optional(),
  // Match-specific
  opponentName: z.string().optional(),
  matchFormat: z.string().optional(),
  // Meetup-specific
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
    marginBottom: 16,
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

  // Collapsible sections state (collapsed by default for mobile optimization)
  const [showDescription, setShowDescription] = useState(false);
  const [showRecurrence, setShowRecurrence] = useState(false);
  const [showParticipantLimit, setShowParticipantLimit] = useState(false);
  
  // Looking for Players state (for match and training)
  const [lookingForPlayers, setLookingForPlayers] = useState(false);
  const [playersNeeded, setPlayersNeeded] = useState("4");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      startTime: '19:00',
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
      is_public: eventType === 'meetup' ? (values.isPublic ?? !teamId) : false,
      team_id: selectedTeamId || teamId || undefined,
      // Match-specific
      opponent_name: eventType === 'match' 
        ? (opponentInputMode === 'select' ? opponentTeamName : values.opponentName) || undefined
        : undefined,
      opponent_team_id: eventType === 'match' && opponentInputMode === 'select' ? opponentTeamId || undefined : undefined,
      home_away: eventType === 'match' ? homeAway : undefined,
      match_format: eventType === 'match' ? values.matchFormat || undefined : undefined,
      // Meetup-specific
      meetup_category: eventType === 'meetup' ? selectedCategory || undefined : undefined,
      // Looking for players - only for match and training
      looking_for_players: showLookingForPlayersSection ? lookingForPlayers : undefined,
      players_needed: showLookingForPlayersSection && lookingForPlayers ? parseInt(playersNeeded, 10) : undefined,
      // Recurrence
      is_recurring: isRecurring,
      recurrence_rule: generateRecurrenceRule(),
    };

    await onSubmit(eventData);
  };

  // Visibility conditions
  const showSportSelector = !teamId && (eventType === 'match' || eventType === 'training');
  const showTeamSelector = !teamId && (eventType === 'match' || eventType === 'training');
  const showOpponentSection = eventType === 'match';
  const showHomeAwayToggle = eventType === 'match';
  const showMatchFormat = eventType === 'match';
  const showCategorySelector = eventType === 'meetup';
  const showLocationMode = eventType === 'meetup';
  const showVirtualLink = eventType === 'meetup' && (locationMode === 'virtual' || locationMode === 'hybrid');
  const showPublicToggle = eventType === 'meetup' && !teamId;
  const showLookingForPlayersSection = eventType === 'match' || eventType === 'training';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Event Type Selector */}
        <EventTypeSelector value={eventType} onChange={setEventType} />

        <div className="space-y-4" aria-live="polite">
          <AnimatePresence mode="sync">
            {/* Sport Selector - Match & Training only when no teamId */}
            {showSportSelector && (
              <motion.div
                key="sport-selector"
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={transitionConfig}
              >
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

            {/* Team Selector - Match & Training only when no teamId */}
            {showTeamSelector && (
              <motion.div
                key="team-selector"
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={transitionConfig}
              >
                <MyTeamSelector
                  value={selectedTeamId}
                  onChange={handleTeamSelect}
                  sportFilter={selectedSport || undefined}
                  label={eventType === 'match' ? t('form.game.yourTeam') : t('details.team')}
                  placeholder={t('form.game.selectTeam')}
                />
              </motion.div>
            )}

            {/* Opponent Section - Match only */}
            {showOpponentSection && (
              <motion.div
                key="opponent-section"
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={transitionConfig}
              >
                <div className="space-y-3 p-4 bg-muted/30 rounded-xl border">
                  <Label>{t('form.game.opponentTeam')}</Label>
                  
                  {/* Toggle between select and manual */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={opponentInputMode === 'select' ? 'default' : 'outline'}
                      onClick={() => setOpponentInputMode('select')}
                      className="flex-1"
                    >
                      {t('form.game.selectTeam')}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={opponentInputMode === 'manual' ? 'default' : 'outline'}
                      onClick={() => setOpponentInputMode('manual')}
                      className="flex-1"
                    >
                      {t('form.game.enterManually')}
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
                            <Input
                              {...field}
                              placeholder={t('form.game.opponentPlaceholder')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </motion.div>
            )}

            {/* Home/Away Toggle - Match only */}
            {showHomeAwayToggle && (
              <motion.div
                key="home-away"
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={transitionConfig}
              >
                <div className="space-y-2">
                  <Label>{t('form.game.location')}</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['home', 'away', 'neutral'] as const).map((option) => (
                      <Button
                        key={option}
                        type="button"
                        variant={homeAway === option ? 'default' : 'outline'}
                        onClick={() => setHomeAway(option)}
                        className="h-11"
                      >
                        {option === 'home' ? '🏠' : option === 'away' ? '✈️' : '⚖️'}{' '}
                        {t(`form.game.${option}`)}
                      </Button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Category Selector - Meetup only */}
            {showCategorySelector && (
              <motion.div
                key="category-selector"
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={transitionConfig}
              >
                <div className="space-y-2">
                  <Label>{t('form.meetup.category')}</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {MEETUP_CATEGORIES.map(({ value, emoji }) => (
                      <Button
                        key={value}
                        type="button"
                        variant={selectedCategory === value ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory(value)}
                        className="h-12 flex flex-col items-center gap-0.5 text-xs"
                      >
                        <span className="text-lg">{emoji}</span>
                        <span className="truncate w-full text-center">{getCategoryLabel(value)}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Title Field - Always visible */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.title')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
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

          {/* When Section */}
          <div className="p-4 bg-muted/30 rounded-xl border space-y-4 overflow-hidden">
            <Label className="text-sm font-medium">{t('details.when')}</Label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col min-w-0">
                    <FormLabel className="text-xs">{t('form.date')}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "h-11 pl-3 text-left font-normal w-full min-w-0",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <span className="truncate flex-1">
                              {field.value ? format(field.value, "MMM dd, yyyy") : t('form.pickDate')}
                            </span>
                            <CalendarIcon className="ml-2 h-4 w-4 opacity-50 shrink-0" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
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
                    <FormLabel className="text-xs">{t('form.startTime')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="time"
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label className="text-xs">{t('form.duration')}</Label>
              <DurationPicker
                value={duration}
                onChange={setDuration}
              />
            </div>
          </div>

          {/* Where Section */}
          <div className="p-4 bg-muted/30 rounded-xl border space-y-4">
            <Label className="text-sm font-medium">{t('details.where')}</Label>

            <AnimatePresence mode="sync">
              {/* Location Mode Toggle - Meetup only */}
              {showLocationMode && (
                <motion.div
                  key="location-mode"
                  variants={fieldVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={transitionConfig}
                >
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <Button
                      type="button"
                      variant={locationMode === 'physical' ? 'default' : 'outline'}
                      onClick={() => setLocationMode('physical')}
                      className="h-10 gap-1.5"
                    >
                      <MapPin className="h-4 w-4" />
                      <span className="text-xs">Physical</span>
                    </Button>
                    <Button
                      type="button"
                      variant={locationMode === 'virtual' ? 'default' : 'outline'}
                      onClick={() => setLocationMode('virtual')}
                      className="h-10 gap-1.5"
                    >
                      <Video className="h-4 w-4" />
                      <span className="text-xs">Virtual</span>
                    </Button>
                    <Button
                      type="button"
                      variant={locationMode === 'hybrid' ? 'default' : 'outline'}
                      onClick={() => setLocationMode('hybrid')}
                      className="h-10 gap-1.5"
                    >
                      <Link2 className="h-4 w-4" />
                      <span className="text-xs">Hybrid</span>
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Physical Location */}
            {(locationMode !== 'virtual' || eventType !== 'meetup') && (
              <DistrictSelector
                value={locationValue}
                onChange={setLocationValue}
                placeholder={t('form.locationPlaceholder')}
              />
            )}

            <AnimatePresence mode="sync">
              {/* Virtual Link - Meetup only */}
              {showVirtualLink && (
                <motion.div
                  key="virtual-link"
                  variants={fieldVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={transitionConfig}
                >
                  <FormField
                    control={form.control}
                    name="locationUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">{t('form.meetup.virtualLink')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="url"
                            placeholder="https://zoom.us/j/..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Optional Sections - Collapsed by default for mobile optimization */}
          <div className="space-y-2">
            {/* Add Description Toggle */}
            <AnimatePresence mode="sync">
              {!showDescription && (
                <motion.div
                  key="add-description-toggle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDescription(true)}
                    className="w-full justify-start text-muted-foreground h-10 gap-2 hover:text-foreground"
                  >
                    <Plus className="h-4 w-4" />
                    {t('form.addDescription')}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Description Field - Collapsible */}
            <AnimatePresence mode="sync">
              {showDescription && (
                <motion.div
                  key="description-field"
                  variants={fieldVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={transitionConfig}
                >
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>{t('form.description')}</FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowDescription(false);
                              field.onChange('');
                            }}
                            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                          >
                            {t('form.remove')}
                          </Button>
                        </div>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={t('form.descriptionPlaceholder')}
                            className="min-h-[60px] resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Make Recurring Toggle */}
            <AnimatePresence mode="sync">
              {!showRecurrence && (
                <motion.div
                  key="add-recurrence-toggle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRecurrence(true)}
                    className="w-full justify-start text-muted-foreground h-10 gap-2 hover:text-foreground"
                  >
                    <Repeat className="h-4 w-4" />
                    {t('form.makeRecurring')}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recurrence Section - Collapsible with Dropdown */}
            <AnimatePresence mode="sync">
              {showRecurrence && (
                <motion.div
                  key="recurrence-section"
                  variants={fieldVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={transitionConfig}
                >
                  <div className="p-4 bg-muted/30 rounded-xl border space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Repeat className="h-4 w-4" />
                        {t('form.repeat')}
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowRecurrence(false);
                          setIsRecurring(false);
                          setRecurrenceType('none');
                          setRecurrenceEndDate(undefined);
                        }}
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        {t('form.remove')}
                      </Button>
                    </div>
                    
                    {/* Dropdown Select instead of Button Grid */}
                    <Select
                      value={recurrenceType}
                      onValueChange={(value: RecurrenceType) => {
                        setRecurrenceType(value);
                        setIsRecurring(value !== 'none');
                        if (value === 'none') setRecurrenceEndDate(undefined);
                      }}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder={t('form.recurrence.none')} />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="none">{t('form.recurrence.none')}</SelectItem>
                        <SelectItem value="daily">{t('form.recurrence.daily')}</SelectItem>
                        <SelectItem value="weekly">{t('form.recurrence.weekly')}</SelectItem>
                        <SelectItem value="monthly">{t('form.recurrence.monthly')}</SelectItem>
                        <SelectItem value="yearly">{t('form.recurrence.yearly')}</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* End date picker - only when recurring */}
                    <AnimatePresence mode="sync">
                      {isRecurring && recurrenceType !== 'none' && (
                        <motion.div
                          key="recurrence-end"
                          variants={fieldVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          transition={transitionConfig}
                        >
                          <div className="space-y-2">
                            <Label className="text-xs">{t('form.recurrence.until')}</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  className="w-full h-11 justify-start text-left font-normal min-w-0"
                                >
                                  <span className="truncate flex-1">
                                    {recurrenceEndDate 
                                      ? format(recurrenceEndDate, "MMM dd, yyyy") 
                                      : t('form.recurrence.noEndDate')}
                                  </span>
                                  <CalendarIcon className="ml-2 h-4 w-4 opacity-50 shrink-0" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={recurrenceEndDate}
                                  onSelect={setRecurrenceEndDate}
                                  disabled={(date) => date < new Date()}
                                  className="pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Add Participant Limit Toggle */}
            <AnimatePresence mode="sync">
              {!showParticipantLimit && (
                <motion.div
                  key="add-participant-toggle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowParticipantLimit(true)}
                    className="w-full justify-start text-muted-foreground h-10 gap-2 hover:text-foreground"
                  >
                    <Users className="h-4 w-4" />
                    {t('form.addParticipantLimit')}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Participant Limit Section - Collapsible */}
            <AnimatePresence mode="sync">
              {showParticipantLimit && (
                <motion.div
                  key="participant-limit-section"
                  variants={fieldVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={transitionConfig}
                >
                  <div className="p-4 bg-muted/30 rounded-xl border space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {t('details.participants')}
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowParticipantLimit(false);
                          form.setValue('maxParticipants', '');
                        }}
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        {t('form.remove')}
                      </Button>
                    </div>

                    {/* Max Participants */}
                    <FormField
                      control={form.control}
                      name="maxParticipants"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">{t('form.maxParticipants')}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="2"
                              max="100"
                              placeholder="10"
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <AnimatePresence mode="sync">
                      {/* Match Format - Match only */}
                      {showMatchFormat && (
                        <motion.div
                          key="match-format"
                          variants={fieldVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          transition={transitionConfig}
                        >
                          <FormField
                            control={form.control}
                            name="matchFormat"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">{t('form.game.format')}</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder={t('form.game.formatPlaceholder')}
                                    className="h-11"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      )}

                      {/* Public Toggle - Meetup only without team */}
                      {showPublicToggle && (
                        <motion.div
                          key="public-toggle"
                          variants={fieldVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          transition={transitionConfig}
                        >
                          <FormField
                            control={form.control}
                            name="isPublic"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                                  <div className="flex items-center gap-2">
                                    {field.value ? (
                                      <Globe className="h-4 w-4 text-primary" />
                                    ) : (
                                      <Lock className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <div>
                                      <p className="text-sm font-medium">{t('form.isPublic')}</p>
                                      <p className="text-xs text-muted-foreground">{t('form.isPublicDesc')}</p>
                                    </div>
                                  </div>
                                  <FormControl>
                                    <Button
                                      type="button"
                                      variant={field.value ? 'default' : 'outline'}
                                      size="sm"
                                      onClick={() => field.onChange(!field.value)}
                                    >
                                      {field.value ? 'Public' : 'Private'}
                                    </Button>
                                  </FormControl>
                                </div>
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Looking for Players Section - Match & Training only */}
            <AnimatePresence mode="sync">
              {showLookingForPlayersSection && (
                <motion.div
                  key="looking-for-players-section"
                  variants={fieldVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={transitionConfig}
                >
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{t('lookingForPlayers.title')}</p>
                          <p className="text-xs text-muted-foreground">{t('lookingForPlayers.description')}</p>
                        </div>
                      </div>
                      <Switch
                        checked={lookingForPlayers}
                        onCheckedChange={setLookingForPlayers}
                      />
                    </div>

                    <AnimatePresence mode="sync">
                      {lookingForPlayers && (
                        <motion.div
                          key="players-needed-input"
                          variants={fieldVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          transition={transitionConfig}
                        >
                          <div className="space-y-2">
                            <Label className="text-xs">{t('lookingForPlayers.playersNeeded')}</Label>
                            <Select value={playersNeeded} onValueChange={setPlayersNeeded}>
                              <SelectTrigger className="h-11">
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
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Live Preview */}
          <EventPreviewCard
            type={eventType}
            title={watchedTitle}
            date={watchedDate}
            startTime={watchedStartTime}
            location={locationValue.venueName || ''}
            maxParticipants={watchedMaxParticipants}
            opponentName={opponentInputMode === 'select' ? opponentTeamName : watchedOpponentName}
            category={selectedCategory ? getCategoryLabel(selectedCategory) : undefined}
          />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 h-12"
              disabled={isSubmitting}
            >
              {t('form.cancel', { ns: 'common', defaultValue: 'Cancel' })}
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12"
              disabled={isSubmitting}
            >
              {isSubmitting ? '...' : t('createEvent')}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
