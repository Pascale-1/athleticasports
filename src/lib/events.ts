import { format, isFuture, isPast, isToday, isTomorrow, isThisWeek } from "date-fns";
import { EventType } from "./eventConfig";

export interface Event {
  id: string;
  team_id: string | null;
  type: EventType;
  title: string;
  description: string | null;
  location: string | null;
  location_type: 'physical' | 'virtual' | 'tbd' | null;
  location_url: string | null;
  start_time: string;
  end_time: string;
  max_participants: number | null;
  is_public: boolean;
  is_recurring: boolean;
  recurrence_rule: string | null;
  opponent_name: string | null;
  opponent_logo_url: string | null;
  match_format: string | null;
  home_away: 'home' | 'away' | 'neutral' | null;
  meetup_category: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EventWithAttendance extends Event {
  attending_count?: number;
  maybe_count?: number;
  not_attending_count?: number;
  user_status?: string | null;
}

// Type guards
export const isTrainingEvent = (event: Event): boolean => event.type === 'training';
export const isMeetupEvent = (event: Event): boolean => event.type === 'meetup';
export const isMatchEvent = (event: Event): boolean => event.type === 'match';
export const isTeamEvent = (event: Event): boolean => event.team_id !== null;
export const isPublicEvent = (event: Event): boolean => event.is_public;

// Date utilities
export const formatEventDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  if (isToday(date)) return `Today at ${format(date, 'HH:mm')}`;
  if (isTomorrow(date)) return `Tomorrow at ${format(date, 'HH:mm')}`;
  if (isThisWeek(date)) return format(date, "EEEE 'at' HH:mm");
  
  return format(date, "MMM dd 'at' HH:mm");
};

export const formatEventDateRange = (startTime: string, endTime: string): string => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  if (format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) {
    return `${format(start, 'MMM dd, yyyy • HH:mm')} - ${format(end, 'HH:mm')}`;
  }
  
  return `${format(start, 'MMM dd, HH:mm')} - ${format(end, 'MMM dd, HH:mm')}`;
};

export const isUpcomingEvent = (event: Event): boolean => {
  return isFuture(new Date(event.start_time));
};

export const isPastEvent = (event: Event): boolean => {
  return isPast(new Date(event.end_time));
};

export const isOngoingEvent = (event: Event): boolean => {
  const now = new Date();
  const start = new Date(event.start_time);
  const end = new Date(event.end_time);
  return now >= start && now <= end;
};

// Event status
export const getEventStatus = (event: Event): 'upcoming' | 'ongoing' | 'past' => {
  if (isOngoingEvent(event)) return 'ongoing';
  if (isPastEvent(event)) return 'past';
  return 'upcoming';
};

// Location formatting
export const formatEventLocation = (event: Event): string => {
  if (!event.location && !event.location_type) return 'Location TBD';
  
  if (event.location_type === 'virtual') {
    return event.location_url ? 'Virtual Event' : 'Online';
  }
  
  if (event.location_type === 'tbd') {
    return 'Location TBD';
  }
  
  return event.location || 'Location TBD';
};

// Attendance calculations
export const getTotalAttendance = (event: EventWithAttendance): number => {
  return (event.attending_count || 0) + (event.maybe_count || 0);
};

export const getAttendancePercentage = (event: EventWithAttendance, totalMembers: number): number => {
  if (totalMembers === 0) return 0;
  const attending = event.attending_count || 0;
  return Math.round((attending / totalMembers) * 100);
};

// Filter and sort utilities
export const filterEventsByType = (events: Event[], type: EventType | 'all'): Event[] => {
  if (type === 'all') return events;
  return events.filter(event => event.type === type);
};

export const filterEventsByStatus = (
  events: Event[],
  status: 'all' | 'upcoming' | 'past'
): Event[] => {
  if (status === 'all') return events;
  if (status === 'upcoming') return events.filter(isUpcomingEvent);
  if (status === 'past') return events.filter(isPastEvent);
  return events;
};

export const sortEventsByDate = (
  events: Event[],
  order: 'asc' | 'desc' = 'asc'
): Event[] => {
  return [...events].sort((a, b) => {
    const dateA = new Date(a.start_time).getTime();
    const dateB = new Date(b.start_time).getTime();
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
};
