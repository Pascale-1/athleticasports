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
import { Switch } from "@/components/ui/switch";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CreateEventData } from "@/hooks/useEvents";
import { DistrictSelector } from "@/components/location/DistrictSelector";
import { getDistrictLabel } from "@/lib/parisDistricts";
import { useState } from "react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  category: z.string().min(1, "Category is required"),
  locationUrl: z.string().url().optional().or(z.literal("")),
  date: z.date({ required_error: "Date is required" }),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  maxParticipants: z.string().min(1, "Number of participants is required"),
  isPublic: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface MeetupEventFormProps {
  teamId?: string;
  onSubmit: (data: CreateEventData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const CATEGORIES = {
  en: [
    { value: 'social', label: 'Social' },
    { value: 'dining', label: 'Dining' },
    { value: 'networking', label: 'Networking' },
    { value: 'celebration', label: 'Celebration' },
    { value: 'other', label: 'Other' },
  ],
  fr: [
    { value: 'social', label: 'Social' },
    { value: 'dining', label: 'Repas' },
    { value: 'networking', label: 'Networking' },
    { value: 'celebration', label: 'Célébration' },
    { value: 'other', label: 'Autre' },
  ],
};

export const MeetupEventForm = ({ teamId, onSubmit, onCancel, isSubmitting }: MeetupEventFormProps) => {
  const { i18n, t } = useTranslation();
  const lang = (i18n.language?.split('-')[0] || 'fr') as 'en' | 'fr';
  const [location, setLocation] = useState<{ district: string; venueName?: string }>({ district: '', venueName: '' });
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      locationUrl: "",
      startTime: "19:00",
      endTime: "21:00",
      isPublic: !teamId,
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
      team_id: teamId || null,
      type: 'meetup',
      title: values.title,
      description: values.description || undefined,
      meetup_category: values.category,
      location: locationString,
      location_type: values.locationUrl ? 'virtual' : locationString ? 'physical' : 'tbd',
      location_url: values.locationUrl || undefined,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      max_participants: values.maxParticipants ? parseInt(values.maxParticipants) : undefined,
      is_public: values.isPublic,
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
              <FormLabel>{lang === 'fr' ? 'Titre du meetup' : 'Meetup Title'}</FormLabel>
              <FormControl>
                <Input placeholder={lang === 'fr' ? 'ex: Dîner et soirée équipe' : 'e.g., Team Dinner & Social'} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{lang === 'fr' ? 'Catégorie' : 'Category'}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={lang === 'fr' ? 'Sélectionner une catégorie' : 'Select category'} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORIES[lang].map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  placeholder={lang === 'fr' ? "Quel est le programme ?" : "What's the plan?"} 
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
                <FormLabel>{lang === 'fr' ? 'Heure de début' : 'Start Time'}</FormLabel>
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
          label={lang === 'fr' ? 'Lieu physique (optionnel)' : 'Physical Location (Optional)'}
          venueLabel={lang === 'fr' ? 'Nom du lieu' : 'Venue name'}
          venuePlaceholder={lang === 'fr' ? "ex: Café Joe's, rue principale" : "e.g., Joe's Cafe, Main St"}
        />

        <FormField
          control={form.control}
          name="locationUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{lang === 'fr' ? 'Lien virtuel (optionnel)' : 'Virtual Link (Optional)'}</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://meet.google.com/..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxParticipants"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{lang === 'fr' ? 'Nombre de participants' : 'Number of Participants'}</FormLabel>
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
                  <FormLabel>{lang === 'fr' ? 'Événement public' : 'Public Event'}</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    {lang === 'fr' 
                      ? 'Tout le monde peut découvrir et rejoindre ce meetup'
                      : 'Anyone can discover and join this meetup'}
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
            {t('actions.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? t('actions.loading') : (lang === 'fr' ? 'Créer le meetup' : 'Create Meetup')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
