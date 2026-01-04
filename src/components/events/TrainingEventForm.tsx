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
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CreateEventData } from "@/hooks/useEvents";
import { DistrictSelector } from "@/components/location/DistrictSelector";
import { getDistrictLabel } from "@/lib/parisDistricts";
import { DurationPicker } from "./DurationPicker";
import { SportQuickSelector } from "./SportQuickSelector";
import { getSportDefaults } from "@/lib/sportDefaults";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  date: z.date({ required_error: "Date is required" }),
  startTime: z.string().min(1, "Start time is required"),
  maxParticipants: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface TrainingEventFormProps {
  teamId?: string;
  sport?: string;
  onSubmit: (data: CreateEventData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const TrainingEventForm = ({ teamId, sport: initialSport, onSubmit, onCancel, isSubmitting }: TrainingEventFormProps) => {
  const { i18n, t } = useTranslation('events');
  const lang = (i18n.language?.split('-')[0] || 'fr') as 'en' | 'fr';
  const [location, setLocation] = useState<{ district: string; venueName?: string }>({ district: '', venueName: '' });
  const [selectedSport, setSelectedSport] = useState<string | null>(initialSport || null);
  const [duration, setDuration] = useState(90); // Default 1.5h
  
  const sportDefaults = getSportDefaults(selectedSport);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      startTime: "18:00",
      maxParticipants: "",
    },
  });

  // Update duration when sport changes
  useEffect(() => {
    if (selectedSport) {
      setDuration(sportDefaults.duration);
    }
  }, [selectedSport, sportDefaults.duration]);

  const handleSubmit = (values: FormData) => {
    const startDateTime = new Date(values.date);
    const [startHour, startMinute] = values.startTime.split(':');
    startDateTime.setHours(parseInt(startHour), parseInt(startMinute));

    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + duration);

    const locationString = location.district 
      ? `${getDistrictLabel(location.district, lang)}${location.venueName ? ` - ${location.venueName}` : ''}`
      : undefined;

    onSubmit({
      team_id: teamId || null,
      type: 'training',
      title: values.title,
      description: values.description || undefined,
      location: locationString,
      location_type: locationString ? 'physical' : 'tbd',
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      max_participants: values.maxParticipants ? parseInt(values.maxParticipants) : undefined,
      is_public: !teamId,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        {/* Sport selector - only show if no team context */}
        {!teamId && (
          <SportQuickSelector
            value={selectedSport}
            onChange={setSelectedSport}
            label={t('form.sport')}
            lang={lang}
          />
        )}

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.training.title')}</FormLabel>
              <FormControl>
                <Input placeholder={t('form.training.titlePlaceholder')} {...field} />
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
              <FormLabel>{t('form.descriptionOptional')}</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={t('form.training.descPlaceholder')} 
                  className="resize-none h-20" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* When section - Date & Time */}
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
              presets={[60, 90, 120]}
            />
          </div>
        </div>

        {/* Location */}
        <DistrictSelector
          value={location}
          onChange={setLocation}
          label={t('form.locationOptional')}
          venueLabel={t('form.venueName')}
          venuePlaceholder={lang === 'fr' ? 'ex: Gymnase A, Terrain principal' : 'e.g., Main Field, Gym A'}
        />

        <FormField
          control={form.control}
          name="maxParticipants"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.participants')}</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1" 
                  placeholder={selectedSport ? String(sportDefaults.players) : (lang === 'fr' ? 'ex: 10' : 'e.g., 10')} 
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
            {isSubmitting ? t('actions.loading', { ns: 'common' }) : t('form.training.create')}
          </Button>
        </div>
      </form>
    </Form>
  );
};