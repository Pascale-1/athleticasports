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
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CreateEventData } from "@/hooks/useEvents";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  opponentName: z.string().min(1, "Opponent name is required").max(100),
  opponentLogoUrl: z.string().url().optional().or(z.literal("")),
  homeAway: z.enum(['home', 'away', 'neutral']),
  matchFormat: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  location: z.string().max(200).optional(),
  date: z.date({ required_error: "Date is required" }),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
});

type FormData = z.infer<typeof formSchema>;

interface MatchEventFormProps {
  teamId?: string;
  onSubmit: (data: CreateEventData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const MatchEventForm = ({ teamId, onSubmit, onCancel, isSubmitting }: MatchEventFormProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      opponentName: "",
      opponentLogoUrl: "",
      homeAway: 'home',
      matchFormat: "",
      description: "",
      location: "",
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

    onSubmit({
      team_id: teamId || null,
      type: 'match',
      title: values.title,
      description: values.description || undefined,
      opponent_name: values.opponentName,
      opponent_logo_url: values.opponentLogoUrl || undefined,
      home_away: values.homeAway,
      match_format: values.matchFormat || undefined,
      location: values.location || undefined,
      location_type: values.location ? 'physical' : 'tbd',
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
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
              <FormLabel>Match Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Championship Final" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="opponentName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opponent Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., City Rivals FC" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="homeAway"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Match Location</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="away">Away</SelectItem>
                  <SelectItem value="neutral">Neutral Venue</SelectItem>
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
              <FormLabel>Match Format (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 11v11, 5v5, Best of 3" {...field} />
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional match details" 
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
                <FormLabel>Kickoff Time</FormLabel>
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
              <FormLabel>Venue (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Central Stadium" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "Creating..." : "Create Match"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
