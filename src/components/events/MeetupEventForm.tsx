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
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, MapPin, Video, Tv, Utensils, Wine, PartyPopper, Dumbbell } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CreateEventData } from "@/hooks/useEvents";
import { DistrictSelector } from "@/components/location/DistrictSelector";
import { getDistrictLabel } from "@/lib/parisDistricts";
import { DurationPicker } from "./DurationPicker";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  category: z.string().min(1, "Category is required"),
  locationUrl: z.string().url().optional().or(z.literal("")),
  date: z.date({ required_error: "Date is required" }),
  startTime: z.string().min(1, "Start time is required"),
  maxParticipants: z.string().optional(),
  isPublic: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface MeetupEventFormProps {
  teamId?: string;
  onSubmit: (data: CreateEventData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

type LocationMode = 'physical' | 'virtual' | 'hybrid';

const CATEGORIES = [
  { value: 'watch_party', emoji: '📺', icon: Tv },
  { value: 'post_game', emoji: '🍻', icon: Wine },
  { value: 'team_dinner', emoji: '🍽️', icon: Utensils },
  { value: 'social', emoji: '🎉', icon: PartyPopper },
  { value: 'fitness', emoji: '💪', icon: Dumbbell },
  { value: 'other', emoji: '📌', icon: MapPin },
];

export const MeetupEventForm = ({ teamId, onSubmit, onCancel, isSubmitting }: MeetupEventFormProps) => {
  const { i18n, t } = useTranslation('events');
  const lang = (i18n.language?.split('-')[0] || 'fr') as 'en' | 'fr';
  const [location, setLocation] = useState<{ district: string; venueName?: string }>({ district: '', venueName: '' });
  const [locationMode, setLocationMode] = useState<LocationMode>('physical');
  const [duration, setDuration] = useState(120); // Default 2h for meetups
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      locationUrl: "",
      startTime: "19:00",
      maxParticipants: "",
      isPublic: !teamId,
    },
  });

  const selectedCategory = form.watch('category');

  const handleSubmit = (values: FormData) => {
    const startDateTime = new Date(values.date);
    const [startHour, startMinute] = values.startTime.split(':');
    startDateTime.setHours(parseInt(startHour), parseInt(startMinute));

    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + duration);

    const locationString = location.district 
      ? `${getDistrictLabel(location.district, lang)}${location.venueName ? ` - ${location.venueName}` : ''}`
      : undefined;

    const locationType = locationMode === 'virtual' ? 'virtual' 
      : locationMode === 'physical' && locationString ? 'physical' 
      : 'tbd';

    onSubmit({
      team_id: teamId || null,
      type: 'meetup',
      title: values.title,
      description: values.description || undefined,
      meetup_category: values.category,
      location: locationString,
      location_type: locationType,
      location_url: values.locationUrl || undefined,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      max_participants: values.maxParticipants ? parseInt(values.maxParticipants) : undefined,
      is_public: values.isPublic,
    });
  };

  const handleTemplateClick = (categoryValue: string, title: string) => {
    form.setValue('category', categoryValue);
    form.setValue('title', title);
  };

  const getCategoryLabel = (value: string) => {
    const key = value === 'watch_party' ? 'watchParty' 
      : value === 'post_game' ? 'postGame'
      : value === 'team_dinner' ? 'teamDinner'
      : value;
    return t(`categories.${key}`);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.meetup.title')}</FormLabel>
              <FormControl>
                <Input placeholder={t('form.meetup.titlePlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category selector as button group */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.meetup.category')}</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <Button
                    key={cat.value}
                    type="button"
                    variant={field.value === cat.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => field.onChange(cat.value)}
                    className="justify-start gap-2"
                  >
                    <span>{cat.emoji}</span>
                    <span className="truncate text-xs">{getCategoryLabel(cat.value)}</span>
                  </Button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.descriptionOptional')}</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={t('form.meetup.descPlaceholder')} 
                  className="resize-none h-20" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  <FormLabel>{t('form.startTime')}</FormLabel>
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
              presets={[60, 120, 180]}
            />
          </div>
        </div>

        {/* Location mode toggle */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={locationMode === 'physical' ? "default" : "outline"}
              onClick={() => setLocationMode('physical')}
              className="flex-1"
            >
              <MapPin className="h-4 w-4 mr-1" />
              {lang === 'fr' ? 'En personne' : 'In Person'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={locationMode === 'virtual' ? "default" : "outline"}
              onClick={() => setLocationMode('virtual')}
              className="flex-1"
            >
              <Video className="h-4 w-4 mr-1" />
              {lang === 'fr' ? 'En ligne' : 'Online'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={locationMode === 'hybrid' ? "default" : "outline"}
              onClick={() => setLocationMode('hybrid')}
              className="flex-1"
            >
              {lang === 'fr' ? 'Hybride' : 'Hybrid'}
            </Button>
          </div>

          {(locationMode === 'physical' || locationMode === 'hybrid') && (
            <DistrictSelector
              value={location}
              onChange={setLocation}
              label={t('form.meetup.physicalLocation')}
              venueLabel={t('form.venueName')}
              venuePlaceholder={lang === 'fr' ? "ex: Café Joe's, rue principale" : "e.g., Joe's Cafe, Main St"}
            />
          )}

          {(locationMode === 'virtual' || locationMode === 'hybrid') && (
            <FormField
              control={form.control}
              name="locationUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.meetup.virtualLink')}</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://meet.google.com/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="maxParticipants"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.participants')}</FormLabel>
              <FormControl>
                <Input type="number" min="1" placeholder={lang === 'fr' ? 'ex: 20' : 'e.g., 20'} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!teamId && (
          <FormField
            control={form.control}
            name="isPublic"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>{t('form.isPublic')}</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    {t('form.isPublicDesc')}
                  </div>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            {t('actions.cancel', { ns: 'common' })}
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? t('actions.loading', { ns: 'common' }) : t('form.meetup.create')}
          </Button>
        </div>
      </form>
    </Form>
  );
};