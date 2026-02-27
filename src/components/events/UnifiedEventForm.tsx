import { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, subHours } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarIcon, Globe, Lock, Link2, MapPin, Video, Repeat, Users, UserPlus,
  Clock, Euro, ChevronDown, Dumbbell, AlignLeft, type LucideIcon,
  PenLine, Loader2, Swords, ChevronLeft, ChevronRight, Check
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import { EventType } from "@/lib/eventConfig";
import { CreateEventData } from "@/hooks/useEvents";
import { getActiveSports, getSportLabel } from "@/lib/sports";

import { EventTypeSelector } from "./EventTypeSelector";
import { DurationPicker } from "./DurationPicker";
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
  { value: 'activity', emoji: '🏃' },
  { value: 'other', emoji: '📋' },
];

// Training intensity options
type TrainingIntensity = 'light' | 'moderate' | 'intense';
const TRAINING_INTENSITIES: TrainingIntensity[] = ['light', 'moderate', 'intense'];

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
  onTypeChange?: (type: EventType) => void;
}

// FieldRow — icon-anchored row, defined outside component for stable identity
const FieldRow = ({
  icon: Icon,
  children,
  className,
  separator = true,
  iconAlign = 'top',
}: {
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
  separator?: boolean;
  iconAlign?: 'top' | 'center';
}) => (
  <div className={cn("relative flex gap-4 py-3.5", separator && "border-b border-border/30", iconAlign === 'center' ? 'items-center' : 'items-start', className)}>
    <div className={cn(
      "h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0",
      iconAlign === 'top' ? 'mt-0.5' : ''
    )}>
      <Icon className="h-[18px] w-[18px] text-primary" />
    </div>
    <div className="flex-1 min-w-0">{children}</div>
  </div>
);

// Step progress header — "Step 2 of 4 · When & Where"
const StepHeader = ({ current, total, labels }: { current: number; total: number; labels: string[] }) => (
  <div className="px-4 pt-4 pb-3 space-y-2.5">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="text-xs font-bold text-primary-foreground bg-primary rounded-full h-6 w-6 flex items-center justify-center">
          {current + 1}
        </span>
        <span className="text-base font-bold text-foreground tracking-tight">
          {labels[current]}
        </span>
      </div>
      <span className="text-xs text-muted-foreground font-medium">
        {current + 1} / {total}
      </span>
    </div>
    {/* Progress bar */}
    <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
      <div
        className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
        style={{ width: `${((current + 1) / total) * 100}%` }}
      />
    </div>
  </div>
);

// Step card wrapper
const StepCard = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl bg-card border border-border/30 shadow-sm mx-2 overflow-visible">
    <div className="px-5 py-4 space-y-1">
      {children}
    </div>
  </div>
);

// Slide direction for transitions
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
  }),
};

export const UnifiedEventForm = ({
  teamId,
  sport: initialSport,
  defaultType = 'training',
  onSubmit,
  onCancel,
  isSubmitting = false,
  onTypeChange,
}: UnifiedEventFormProps) => {
  const { t, i18n } = useTranslation('events');
  const lang = (i18n.language?.split('-')[0] || 'en') as 'en' | 'fr';

  // Event type state
  const [eventType, setEventType] = useState<EventType>(defaultType);

  const handleTypeChange = (type: EventType) => {
    setEventType(type);
    onTypeChange?.(type);
  };

  // Shared states
  const [selectedSport, setSelectedSport] = useState(initialSport || '');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(teamId || null);
  const [selectedTeamName, setSelectedTeamName] = useState<string>('');
  const [duration, setDuration] = useState(DEFAULT_DURATIONS[defaultType]);
  const [locationValue, setLocationValue] = useState<{ district: string; venueName?: string }>({ district: '' });

  // Match-specific states
  const [homeAway, setHomeAway] = useState<'home' | 'away' | 'neutral'>('home');
  const [opponentTeamId, setOpponentTeamId] = useState<string | null>(null);
  const [opponentTeamName, setOpponentTeamName] = useState<string>('');
  const [opponentInputMode, setOpponentInputMode] = useState<'select' | 'manual'>('manual');

  // Meetup-specific states
  const [locationMode, setLocationMode] = useState<'physical' | 'virtual' | 'hybrid'>('physical');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Recurrence states
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('none');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | undefined>(undefined);

  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // Training intensity
  const [trainingIntensity, setTrainingIntensity] = useState<TrainingIntensity>('moderate');

  // RSVP Deadline state
  const [showRsvpDeadline, setShowRsvpDeadline] = useState(false);
  const [deadlinePreset, setDeadlinePreset] = useState<DeadlinePreset>('24h');
  const [customDeadline, setCustomDeadline] = useState<Date | undefined>(undefined);

  // Looking for Players state (for match and training)
  const [lookingForPlayers, setLookingForPlayers] = useState(false);
  const [playersNeeded, setPlayersNeeded] = useState("4");

  // Cost & Payment state
  const [cost, setCost] = useState('');
  const [costType, setCostType] = useState<'total' | 'per_person'>('total');
  const [hasCost, setHasCost] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');

  // Date picker popover
  const [dateOpen, setDateOpen] = useState(false);

  // Wizard step state
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const allSports = getActiveSports();

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

  // Only watch fields used for RSVP deadline preview
  const watchedDate = form.watch('date');
  const watchedStartTime = form.watch('startTime');

  useEffect(() => {
    setDuration(DEFAULT_DURATIONS[eventType]);
  }, [eventType]);

  useEffect(() => {
    if (eventType === 'match') {
      setOpponentTeamId(null);
      setOpponentTeamName('');
      form.setValue('opponentName', '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSport, eventType]);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeamName, opponentTeamName, homeAway, opponentInputMode, eventType]);

  const handleTeamSelect = (teamId: string | null, teamName?: string) => {
    setSelectedTeamId(teamId);
    setSelectedTeamName(teamName || '');
  };

  const handleOpponentSelect = (teamId: string, teamName: string) => {
    setOpponentTeamId(teamId);
    setOpponentTeamName(teamName);
  };

  const getCategoryLabel = (value: string) => {
    const categoryMap: Record<string, string> = {
      watch_party: t('categories.watchParty'),
      post_game: t('categories.postGame'),
      team_dinner: t('categories.teamDinner'),
      social: t('categories.social'),
      fitness: t('categories.fitness'),
      activity: t('categories.activity'),
      other: t('categories.other'),
    };
    return categoryMap[value] || value;
  };

  const generateRecurrenceRule = (): string | undefined => {
    if (!isRecurring || recurrenceType === 'none') return undefined;
    const freqMap: Record<RecurrenceType, string> = {
      none: '', daily: 'DAILY', weekly: 'WEEKLY', monthly: 'MONTHLY', yearly: 'YEARLY'
    };
    let rule = `FREQ=${freqMap[recurrenceType]}`;
    if (recurrenceEndDate) {
      rule += `;UNTIL=${format(recurrenceEndDate, "yyyyMMdd'T'235959'Z'")}`;
    }
    return rule;
  };

  const calculateRsvpDeadline = (eventDateTime: Date): Date | null => {
    if (!showRsvpDeadline) return null;
    if (deadlinePreset === 'custom') return customDeadline || null;
    const preset = DEADLINE_PRESETS.find(p => p.value === deadlinePreset);
    if (!preset || preset.hours === 0) return null;
    return subHours(eventDateTime, preset.hours);
  };

  const formatDateRow = () => {
    const date = form.getValues('date');
    const time = form.getValues('startTime') || '19:00';
    const dur = duration;
    const h = Math.floor(dur / 60);
    const m = dur % 60;
    const durStr = m === 0 ? `${h}h` : `${h}h${m.toString().padStart(2, '0')}`;
    if (!date) return t('form.pickDate');
    return `${format(date, 'EEE, MMM d')} · ${time} · ${durStr}`;
  };

  // Derived flags — must be declared BEFORE handleSubmit to avoid temporal dead zone
  const isPickupGame = eventType === 'match' && !selectedTeamId && !teamId;
  const showSportSelector = !teamId && (eventType === 'match' || eventType === 'training');
  const showTeamSelector = !teamId && (eventType === 'match' || eventType === 'training');
  const showOpponentSection = eventType === 'match';
  const showHomeAwayToggle = eventType === 'match' && !isPickupGame;
  const showCategorySelector = eventType === 'meetup';
  const showLocationMode = eventType === 'meetup';
  const showVirtualLink = eventType === 'meetup' && (locationMode === 'virtual' || locationMode === 'hybrid');
  const showLookingForPlayersSection = eventType === 'match' || eventType === 'training';

  // Step 2 has content?
  const step2HasContent = showSportSelector || showTeamSelector || showOpponentSection || showCategorySelector;

  // Build step indices — skip step 2 if empty
  const steps = useMemo(() => {
    const s = [0, 2, 3]; // step 0: What, step 2: When & Where, step 3: Options
    if (step2HasContent) s.splice(1, 0, 1); // insert step 1: Details
    return s;
  }, [step2HasContent]);

  const totalSteps = steps.length;
  const currentStepId = steps[currentStep] ?? 0;

  const stepLabels = useMemo(() => {
    const labels: string[] = [
      lang === 'fr' ? 'Quoi' : 'What',
    ];
    if (step2HasContent) labels.push(lang === 'fr' ? 'Détails' : 'Details');
    labels.push(lang === 'fr' ? 'Quand & Où' : 'When & Where');
    labels.push(lang === 'fr' ? 'Options' : 'Options');
    return labels;
  }, [step2HasContent, lang]);

  const validateCurrentStep = async (): Promise<boolean> => {
    switch (currentStepId) {
      case 0:
        return await form.trigger('title');
      case 1:
        return true;
      case 2:
        return await form.trigger(['date', 'startTime', 'location']);
      case 3:
        return true;
      default:
        return true;
    }
  };

  // Guard against mobile tap-through: when "Next" swaps to "Create" in the same position
  const justAdvancedRef = useRef(false);

  const goNext = async () => {
    if (currentStep < totalSteps - 1) {
      const isValid = await validateCurrentStep();
      if (!isValid) return;
      justAdvancedRef.current = true;
      setTimeout(() => { justAdvancedRef.current = false; }, 400);
      setDirection(1);
      setCurrentStep(currentStep + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (values: FormData) => {
    const [hours, minutes] = values.startTime.split(':').map(Number);
    const startDate = new Date(values.date);
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

    let locationType: 'physical' | 'virtual' | 'tbd' = 'physical';
    if (eventType === 'meetup') {
      if (locationMode === 'virtual') locationType = 'virtual';
      else if (locationMode === 'hybrid') locationType = 'physical';
    }

    const eventData: CreateEventData = {
      type: eventType,
      title: values.title,
      description: (() => {
        let desc = values.description || '';
        if (eventType === 'training' && trainingIntensity !== 'moderate') {
          const prefix = `[${trainingIntensity.charAt(0).toUpperCase() + trainingIntensity.slice(1)}]`;
          desc = desc ? `${prefix} ${desc}` : prefix;
        }
        return desc || undefined;
      })(),
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
      meetup_category: eventType === 'meetup' ? selectedCategory || undefined : undefined,
      looking_for_players: showLookingForPlayersSection ? lookingForPlayers : undefined,
      players_needed: showLookingForPlayersSection && lookingForPlayers ? parseInt(playersNeeded, 10) : undefined,
      is_recurring: isRecurring,
      recurrence_rule: generateRecurrenceRule(),
      rsvp_deadline: showRsvpDeadline ? calculateRsvpDeadline(startDate)?.toISOString() : undefined,
      cost: hasCost ? (cost || undefined) : undefined,
      cost_type: hasCost ? costType : undefined,
      payment_link: hasCost && cost && parseFloat(cost) > 0 && paymentLink ? paymentLink : undefined,
    };

    await onSubmit(eventData);
  };

  // ── Step content renderers ──

  const renderStep0 = () => (
    <StepCard>
      {/* Event Type */}
      <div className="pb-3">
        <EventTypeSelector value={eventType} onChange={handleTypeChange} />
      </div>

      {/* Title */}
      <FieldRow icon={PenLine} separator={true}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <input
                  {...field}
                  className="w-full bg-transparent border-b border-border/40 focus:border-primary focus:shadow-[0_1px_0_0_hsl(var(--primary))] outline-none text-base font-medium placeholder:text-muted-foreground/50 text-foreground min-h-[28px] pb-1 transition-all duration-200"
                  placeholder={
                    eventType === 'match'
                      ? t('form.game.titlePlaceholder')
                      : eventType === 'meetup'
                      ? t('form.meetup.titlePlaceholder')
                      : t('form.training.titlePlaceholder')
                  }
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </FieldRow>

      {/* Description */}
      <FieldRow icon={AlignLeft} separator={false}>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <textarea
                  {...field}
                  rows={2}
                  className="w-full bg-transparent border-b border-border/40 focus:border-primary focus:shadow-[0_1px_0_0_hsl(var(--primary))] outline-none text-sm placeholder:text-muted-foreground/50 text-foreground resize-none leading-snug min-h-[40px] pb-1 transition-all duration-200"
                  placeholder={t('form.descriptionPlaceholder')}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </FieldRow>
    </StepCard>
  );

  const renderStep1 = () => (
    <StepCard>
      {/* Sport (dropdown) */}
      {showSportSelector && (
        <FieldRow icon={Dumbbell} separator={showTeamSelector || showOpponentSection} iconAlign="center">
          <Select
            value={selectedSport || ''}
            onValueChange={(val) => {
              setSelectedSport(val);
              setSelectedTeamId(null);
              setSelectedTeamName('');
            }}
          >
            <SelectTrigger className="border-0 bg-transparent shadow-none px-0 h-auto py-0 text-sm focus:ring-0 [&>span]:text-left [&>svg]:text-muted-foreground min-h-[28px]">
              <SelectValue placeholder={lang === 'fr' ? 'Quel sport ?' : 'Which sport?'} />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-lg z-50">
              {allSports.map((sport) => (
                <SelectItem key={sport.id} value={sport.id} className="text-sm">
                  {sport.emoji} {getSportLabel(sport.id, lang)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>
      )}

      {/* Team */}
      {showTeamSelector && (
        <FieldRow icon={Users} separator={showOpponentSection} iconAlign="center">
          <MyTeamSelector
            value={selectedTeamId}
            onChange={handleTeamSelect}
            sportFilter={selectedSport || undefined}
            hideLabel={true}
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
            <div className="flex items-center gap-1.5 text-[10px] mt-1">
              {isPickupGame ? (
                <>
                  <Globe className="h-3 w-3 text-primary" />
                  <span className="text-muted-foreground">{t('form.visibility.public')}</span>
                </>
              ) : selectedTeamId ? (
                <>
                  <Lock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('form.visibility.teamOnly')}</span>
                </>
              ) : null}
            </div>
          )}
        </FieldRow>
      )}

      {/* Opponent (match only) */}
      {showOpponentSection && (
        <FieldRow icon={Swords} separator={false} iconAlign="center">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              {opponentInputMode === 'manual' ? (
                <FormField
                  control={form.control}
                  name="opponentName"
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-0">
                      <FormControl>
                        <input
                          {...field}
                         placeholder={t('form.game.opponentPlaceholder')}
                          className="w-full bg-transparent border-b border-border/40 focus:border-primary outline-none text-sm placeholder:text-muted-foreground/50 text-foreground min-h-[28px] pb-1 transition-colors"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ) : (
                <div className="flex-1 min-w-0">
                  <TeamSelector
                    selectedTeamId={opponentTeamId || undefined}
                    onSelect={handleOpponentSelect}
                    excludeTeamId={selectedTeamId || undefined}
                    sportFilter={selectedSport || undefined}
                    placeholder={t('form.game.opponentPlaceholder')}
                  />
                </div>
              )}
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setOpponentInputMode('manual')}
                  className={cn(
                    "h-7 px-2 rounded text-[10px] font-medium transition-all min-h-[28px]",
                    opponentInputMode === 'manual'
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {lang === 'fr' ? 'Saisir' : 'Type'}
                </button>
                <span className="text-muted-foreground/40 text-[9px]">·</span>
                <button
                  type="button"
                  onClick={() => setOpponentInputMode('select')}
                  className={cn(
                    "h-7 px-2 rounded text-[10px] font-medium transition-all min-h-[28px]",
                    opponentInputMode === 'select'
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {lang === 'fr' ? 'Choisir' : 'Pick'}
                </button>
              </div>
            </div>

            {showHomeAwayToggle && (
              <div className="flex gap-1">
                {(['home', 'away', 'neutral'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setHomeAway(option)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 min-h-[32px]",
                      homeAway === option
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t(`game.${option}`)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </FieldRow>
      )}

      {/* Meetup category in step 1 */}
      {showCategorySelector && (
        <FieldRow icon={AlignLeft} separator={false} iconAlign="top">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{t('form.meetup.category')}</Label>
            <div className="flex flex-wrap gap-1.5">
              {MEETUP_CATEGORIES.map(({ value, emoji }) => {
                const isSelected = selectedCategory === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSelectedCategory(value)}
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 min-h-[32px]",
                      isSelected
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "border-border text-foreground hover:border-foreground/40"
                    )}
                  >
                    <span className="text-sm leading-none">{emoji}</span>
                    {getCategoryLabel(value)}
                  </button>
                );
              })}
            </div>
          </div>
        </FieldRow>
      )}
    </StepCard>
  );

  const renderStep2 = () => (
    <StepCard>
      {/* Date / Time / Duration */}
      <FieldRow icon={CalendarIcon} separator={true}>
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="text-sm text-foreground hover:text-primary transition-colors text-left w-full min-h-[28px]"
            >
              <span className={cn(!watchedDate && "text-muted-foreground/70")}>
                {watchedDate ? formatDateRow() : t('form.pickDate')}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-popover border border-border shadow-lg z-50" align="start" side="top">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(d) => { field.onChange(d); setDateOpen(false); }}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                  initialFocus
                  className="pointer-events-auto"
                />
              )}
            />
          </PopoverContent>
        </Popover>

        {watchedDate && (
          <div className="flex items-center gap-2 mt-1.5">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem className="shrink-0">
                  <FormControl>
                    <input
                      {...field}
                      type="time"
                      className="bg-transparent border-0 outline-none text-sm text-foreground min-h-[28px]"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <span className="text-muted-foreground text-xs">·</span>
            <DurationPicker value={duration} onChange={setDuration} />
          </div>
        )}
        <FormField control={form.control} name="date" render={() => <FormMessage className="text-xs mt-1" />} />
      </FieldRow>

      {/* Where */}
      <FieldRow icon={MapPin} separator={false}>
        {showLocationMode && (
          <div className="flex gap-1.5 mb-2">
            {([
              { mode: 'physical' as const, icon: MapPin },
              { mode: 'virtual' as const, icon: Video },
              { mode: 'hybrid' as const, icon: Link2 },
            ]).map(({ mode, icon: ModeIcon }) => (
              <button
                key={mode}
                type="button"
                onClick={() => setLocationMode(mode)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 min-h-[32px]",
                  locationMode === mode
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <ModeIcon className="h-3 w-3 shrink-0" />
                {t(`form.locationMode.${mode}`)}
              </button>
            ))}
          </div>
        )}

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
                  ghost
                />
                {fieldState.error && (
                  <FormMessage className="text-xs">{t('form.locationRequired')}</FormMessage>
                )}
              </FormItem>
            )}
          />
        )}

        {showVirtualLink && (
          <FormField
            control={form.control}
            name="locationUrl"
            render={({ field }) => (
              <FormItem className="mt-2">
                <FormControl>
                  <input
                    {...field}
                   type="url"
                    placeholder="https://zoom.us/j/..."
                    className="w-full bg-transparent border-b border-border/40 focus:border-primary outline-none text-sm placeholder:text-muted-foreground/50 text-foreground min-h-[28px] pb-1 transition-colors"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        )}
      </FieldRow>
    </StepCard>
  );

  const renderStep3 = () => (
    <StepCard>
      {/* ── Essentials ── */}
      <div className="pb-1 pt-0.5">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {lang === 'fr' ? 'Essentiel' : 'Essentials'}
        </span>
      </div>

      {/* Visibility — pill toggle */}
      {eventType !== 'match' && (
        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FieldRow icon={field.value ? Globe : Lock} separator={true} iconAlign="center">
              <div className="flex items-center justify-between min-h-[32px]">
                <span className="text-sm font-medium">
                  {lang === 'fr' ? 'Visibilité' : 'Visibility'}
                </span>
                <div className="flex rounded-full border border-border overflow-hidden bg-muted/50">
                  <button
                    type="button"
                    onClick={() => field.onChange(true)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all duration-150 min-h-[32px]",
                      field.value
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Globe className="h-3.5 w-3.5" />
                    {lang === 'fr' ? 'Public' : 'Public'}
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange(false)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all duration-150 min-h-[32px]",
                      !field.value
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Lock className="h-3.5 w-3.5" />
                    {lang === 'fr' ? 'Privé' : 'Private'}
                  </button>
                </div>
              </div>
            </FieldRow>
          )}
        />
      )}

      {/* Cost — pill toggle */}
      <FieldRow icon={Euro} separator={true} iconAlign={hasCost ? 'top' : 'center'}>
        <div className="flex items-center justify-between min-h-[32px]">
          <span className="text-sm font-medium">
            {lang === 'fr' ? 'Coût' : 'Cost'}
          </span>
          <div className="flex rounded-full border border-border overflow-hidden bg-muted/50">
            <button
              type="button"
              onClick={() => { setHasCost(false); setCost(''); setPaymentLink(''); }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all duration-150 min-h-[32px]",
                !hasCost
                  ? "bg-success/90 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {lang === 'fr' ? 'Gratuit' : 'Free'}
            </button>
            <button
              type="button"
              onClick={() => setHasCost(true)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all duration-150 min-h-[32px]",
                hasCost
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Euro className="h-3.5 w-3.5" />
              {lang === 'fr' ? 'Payant' : 'Paid'}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {hasCost && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      placeholder={t('cost.placeholder')}
                      className="h-9 text-xs pl-7"
                    />
                  </div>
                  <div className="flex rounded-md border overflow-hidden shrink-0">
                    {(['total', 'per_person'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setCostType(type)}
                        className={cn(
                          "px-2.5 py-1 text-xs transition-colors min-h-[32px]",
                          type === 'per_person' && "border-l",
                          costType === type ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
                        )}
                      >
                        {type === 'total' ? t('cost.total') : t('cost.perPerson')}
                      </button>
                    ))}
                  </div>
                </div>
                {cost && parseFloat(cost) > 0 && (
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5">
                    <Link2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <input
                      value={paymentLink}
                      onChange={(e) => setPaymentLink(e.target.value)}
                      placeholder={t('cost.paymentLinkPlaceholder')}
                      className="flex-1 bg-transparent border-0 outline-none text-xs placeholder:text-muted-foreground/50 text-foreground"
                      type="url"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </FieldRow>

      {/* Max participants */}
      <FormField
        control={form.control}
        name="maxParticipants"
        render={({ field }) => (
          <FieldRow icon={Users} separator={true} iconAlign="center">
            <div className="flex items-center justify-between min-h-[32px]">
              <Label className="text-sm text-foreground">
                {t('form.maxParticipants')}
              </Label>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="2"
                  max="100"
                  placeholder="--"
                  className="w-20 h-9 text-xs text-right"
                />
              </FormControl>
            </div>
          </FieldRow>
        )}
      />

      {/* ── Advanced (collapsible) ── */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowMoreOptions(!showMoreOptions)}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors py-1.5"
        >
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", showMoreOptions && "rotate-180")} />
          <span className="uppercase tracking-widest">
            {lang === 'fr' ? 'Plus d\'options' : 'More options'}
          </span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {showMoreOptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Recurrence */}
            <FieldRow icon={Repeat} separator={true} iconAlign="center">
              <div className="flex items-center justify-between min-h-[32px]">
                <Label className="text-sm text-foreground">
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
                  <SelectContent className="bg-popover border border-border shadow-lg z-50">
                    {(['none', 'daily', 'weekly', 'monthly'] as RecurrenceType[]).map((type) => (
                      <SelectItem key={type} value={type}>{t(`form.recurrence.${type}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isRecurring && (
                <div className="pt-2">
                  <Label className="text-[10px] text-muted-foreground block mb-1">{t('form.recurrence.until')}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-8 justify-start text-left font-normal min-w-0 text-xs">
                        <span className="truncate flex-1">
                          {recurrenceEndDate ? format(recurrenceEndDate, "MMM dd, yyyy") : t('form.recurrence.noEndDate')}
                        </span>
                        <CalendarIcon className="ml-1.5 h-3.5 w-3.5 opacity-50 shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-popover border border-border shadow-lg z-50" align="start" side="top">
                      <Calendar mode="single" selected={recurrenceEndDate} onSelect={setRecurrenceEndDate} disabled={(date) => { const today = new Date(); today.setHours(0, 0, 0, 0); return date < today; }} className="pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </FieldRow>

            {/* RSVP Deadline */}
            <FieldRow icon={Clock} separator={true} iconAlign="center">
              <div className="space-y-2">
                <div className="flex items-center justify-between min-h-[32px]">
                  <Label className="text-sm text-foreground">
                    {t('form.rsvpDeadline')}
                  </Label>
                  <Switch checked={showRsvpDeadline} onCheckedChange={setShowRsvpDeadline} />
                </div>

                {showRsvpDeadline && (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {DEADLINE_PRESETS.map((preset) => (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => setDeadlinePreset(preset.value)}
                          className={cn(
                            "px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 min-h-[32px]",
                            deadlinePreset === preset.value
                              ? "bg-primary/10 text-primary border-primary/30"
                              : "border-border text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {t(`form.deadline.${preset.value}`)}
                        </button>
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
                          <PopoverContent className="w-auto p-0 bg-popover border border-border shadow-lg z-50" align="start" side="top">
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
            </FieldRow>

            {/* Looking for Players */}
            {showLookingForPlayersSection && (
              <FieldRow icon={UserPlus} separator={true} iconAlign="center">
                <div className="space-y-2">
                  <div className="flex items-center justify-between min-h-[32px]">
                    <Label className="text-sm text-foreground">
                      {t('lookingForPlayers.title')}
                    </Label>
                    <Switch checked={lookingForPlayers} onCheckedChange={setLookingForPlayers} />
                  </div>

                  {lookingForPlayers && (
                    <Select value={playersNeeded} onValueChange={setPlayersNeeded}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-border shadow-lg z-50">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? t('lookingForPlayers.player', { defaultValue: 'player' }) : t('lookingForPlayers.players', { defaultValue: 'players' })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </FieldRow>
            )}

            {/* Training intensity */}
            {eventType === 'training' && (
              <FieldRow icon={Dumbbell} separator={false} iconAlign="top">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">{t('form.training.intensity')}</Label>
                  <div className="flex gap-1.5">
                    {TRAINING_INTENSITIES.map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setTrainingIntensity(level)}
                        className={cn(
                          "flex-1 h-9 rounded-full text-xs font-medium border transition-all duration-150 min-h-[36px]",
                          trainingIntensity === level
                            ? "bg-primary/10 text-primary border-primary/30"
                            : "border-border text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {t(`form.training.intensity_${level}`)}
                      </button>
                    ))}
                  </div>
                </div>
              </FieldRow>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </StepCard>
  );

  const renderCurrentStep = () => {
    switch (currentStepId) {
      case 0: return renderStep0();
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      default: return null;
    }
  };

  const isLastStep = currentStep === totalSteps - 1;

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isLastStep) {
            form.handleSubmit(handleSubmit)();
          }
          // Do NOT call goNext() here — only explicit button clicks should advance
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !(e.target instanceof HTMLTextAreaElement)) {
            e.preventDefault();
          }
        }}
        className="min-w-0 overflow-x-hidden flex flex-col h-full"
      >

        {/* Step header */}
        <StepHeader current={currentStep} total={totalSteps} labels={stepLabels} />

        {/* Step content — scrollable area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 pb-4">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStepId}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sticky bottom CTA */}
        <div className="shrink-0 border-t border-border/30 bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                className="h-[52px] px-4 rounded-xl border-border/50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            {isLastStep ? (
              <Button
                type="button"
                onClick={() => {
                  if (!justAdvancedRef.current) {
                    form.handleSubmit(handleSubmit)();
                  }
                }}
                className="flex-1 h-[52px] text-sm font-bold rounded-xl shadow-colored"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('form.creating', 'Creating...')}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    {eventType === 'training' ? t('form.training.create')
                      : eventType === 'match' ? t('form.game.create')
                      : t('form.meetup.create')}
                  </span>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={goNext}
                className="flex-1 h-[52px] text-sm font-bold rounded-xl shadow-colored"
              >
                <span className="flex items-center gap-2">
                  {lang === 'fr' ? 'Suivant' : 'Next'}: {stepLabels[currentStep + 1]}
                  <ChevronRight className="h-4 w-4" />
                </span>
              </Button>
            )}
          </div>
        </div>

      </form>
    </Form>
  );
};
