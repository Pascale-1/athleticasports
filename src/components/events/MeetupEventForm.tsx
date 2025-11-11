import { useForm } from "react-hook-form";
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

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  category: z.string().min(1, "Category is required"),
  location: z.string().max(200).optional(),
  locationUrl: z.string().url().optional().or(z.literal("")),
  date: z.date({ required_error: "Date is required" }),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
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

export const MeetupEventForm = ({ teamId, onSubmit, onCancel, isSubmitting }: MeetupEventFormProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      location: "",
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

    onSubmit({
      team_id: teamId || null,
      type: 'meetup',
      title: values.title,
      description: values.description || undefined,
      meetup_category: values.category,
      location: values.location || undefined,
      location_type: values.locationUrl ? 'virtual' : values.location ? 'physical' : 'tbd',
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
              <FormLabel>Meetup Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Team Dinner & Social" {...field} />
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
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="dining">Dining</SelectItem>
                  <SelectItem value="networking">Networking</SelectItem>
                  <SelectItem value="celebration">Celebration</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What's the plan?" 
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
              <FormLabel>Date</FormLabel>
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
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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
                <FormLabel>Start Time</FormLabel>
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
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Physical Location (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Joe's Cafe, Main St" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="locationUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Virtual Link (Optional)</FormLabel>
              <FormControl>
                <Input type="url" placeholder="e.g., https://meet.google.com/..." {...field} />
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
              <FormLabel>Max Participants (Optional)</FormLabel>
              <FormControl>
                <Input type="number" min="1" placeholder="No limit" {...field} />
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
                  <FormLabel>Public Event</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Anyone can discover and join this meetup
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
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "Creating..." : "Create Meetup"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
