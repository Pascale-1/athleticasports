import { Dumbbell, Users, Trophy, LucideIcon } from "lucide-react";

export type EventType = 'training' | 'meetup' | 'match';
export type EventRole = 'coach' | 'admin' | 'owner' | 'member' | 'all';

export interface EventTypeConfig {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  label: string;
  description: string;
  features: string[];
  permissions: EventRole[];
  categories?: string[];
}

export const EVENT_CONFIG: Record<EventType, EventTypeConfig> = {
  training: {
    icon: Dumbbell,
    color: 'hsl(var(--primary))',
    bgColor: 'hsl(var(--primary) / 0.1)',
    label: 'Workout',
    description: 'Run, train, practice, or work out together',
    features: ['generatedTeams', 'attendance', 'recurring', 'teamOnly'],
    permissions: ['coach', 'admin', 'owner'],
    categories: []
  },
  meetup: {
    icon: Users,
    color: 'hsl(var(--accent))',
    bgColor: 'hsl(var(--accent) / 0.1)',
    label: 'Hangout',
    description: 'Social events, watch parties, team dinners',
    features: ['attendance', 'public', 'maxParticipants', 'categories'],
    permissions: ['all'],
    categories: [
      'Watch Party',
      'Social Event',
      'Casual Play',
      'Team Bonding',
      'Fitness Activity',
      'Other'
    ]
  },
  match: {
    icon: Trophy,
    color: 'hsl(var(--match))',
    bgColor: 'hsl(var(--match) / 0.1)',
    label: 'Match',
    description: 'Compete against another team or player',
    features: ['opponent', 'attendance', 'teamOnly', 'homeAway'],
    permissions: ['coach', 'admin', 'owner'],
    categories: []
  }
};

export const LOCATION_TYPES = [
  { value: 'physical', label: 'Physical Location' },
  { value: 'virtual', label: 'Virtual (Online)' },
  { value: 'tbd', label: 'To Be Determined' }
] as const;

export const ATTENDANCE_STATUS = [
  { value: 'attending', label: 'Attending', color: 'hsl(var(--success))' },
  { value: 'maybe', label: 'Maybe', color: 'hsl(var(--warning))' },
  { value: 'not_attending', label: "Can't Attend", color: 'hsl(var(--destructive))' }
] as const;

export const HOME_AWAY_OPTIONS = [
  { value: 'home', label: 'Home', icon: '🏠' },
  { value: 'away', label: 'Away', icon: '✈️' },
  { value: 'neutral', label: 'Neutral', icon: '⚖️' }
] as const;
