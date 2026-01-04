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
import { useState } from "react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  date: z.date({ required_error: "Date is required" }),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  maxParticipants: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface TrainingEventFormProps {
  teamId?: string;
  onSubmit: (data: CreateEventData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const TrainingEventForm = ({ teamId, onSubmit, onCancel, isSubmitting }: TrainingEventFormProps) => {
  const { i18n, t } = useTranslation();
  const lang = (i18n.language?.split('-')[0] || 'fr') as 'en' | 'fr';
  const [location, setLocation] = useState<{ district: string; venueName?: string }>({ district: '', venueName: '' });
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      startTime: "18:00",
      endTime: "20:00",
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{lang === 'fr' ? "Titre de l'entraînement" : 'Training Title'}</FormLabel>
              <FormControl>
                <Input placeholder={lang === 'fr' ? 'ex: Entraînement du mardi' : 'e.g., Tuesday Practice Session'} {...field} />
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
                  placeholder={lang === 'fr' ? 'Sur quoi allez-vous travailler ?' : 'What will you be working on?'} 
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
          label={lang === 'fr' ? 'Lieu (optionnel)' : 'Location (Optional)'}
          venueLabel={lang === 'fr' ? 'Nom du lieu' : 'Venue name'}
          venuePlaceholder={lang === 'fr' ? 'ex: Gymnase A, Terrain principal' : 'e.g., Main Field, Gym A'}
        />

        <FormField
          control={form.control}
          name="maxParticipants"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{lang === 'fr' ? 'Nombre max de participants (optionnel)' : 'Max Participants (Optional)'}</FormLabel>
              <FormControl>
                <Input type="number" min="1" placeholder={lang === 'fr' ? 'Illimité' : 'No limit'} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            {t('actions.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? t('actions.loading') : (lang === 'fr' ? "Créer l'entraînement" : 'Create Training')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
