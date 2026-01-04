// Sport-specific defaults for event forms

export interface SportDefaults {
  players: number;
  duration: number; // in minutes
  formats: { value: string; label: { en: string; fr: string }; players?: number }[];
  timeLabel: { en: string; fr: string };
}

export const SPORT_DEFAULTS: Record<string, SportDefaults> = {
  padel: {
    players: 4,
    duration: 90,
    formats: [
      { value: 'doubles', label: { en: 'Doubles', fr: 'Double' }, players: 4 },
      { value: 'singles', label: { en: 'Singles', fr: 'Simple' }, players: 2 },
      { value: 'best_of_3', label: { en: 'Best of 3 Sets', fr: 'Meilleur des 3 sets' }, players: 4 },
    ],
    timeLabel: { en: 'Start Time', fr: 'Heure de début' },
  },
  tennis: {
    players: 4,
    duration: 120,
    formats: [
      { value: 'singles', label: { en: 'Singles', fr: 'Simple' }, players: 2 },
      { value: 'doubles', label: { en: 'Doubles', fr: 'Double' }, players: 4 },
      { value: 'best_of_3', label: { en: 'Best of 3 Sets', fr: 'Meilleur des 3 sets' } },
      { value: 'best_of_5', label: { en: 'Best of 5 Sets', fr: 'Meilleur des 5 sets' } },
    ],
    timeLabel: { en: 'Start Time', fr: 'Heure de début' },
  },
  football: {
    players: 22,
    duration: 90,
    formats: [
      { value: '11v11', label: { en: '11 vs 11', fr: '11 contre 11' }, players: 22 },
      { value: '7v7', label: { en: '7 vs 7', fr: '7 contre 7' }, players: 14 },
      { value: '5v5', label: { en: '5 vs 5 (Futsal)', fr: '5 contre 5 (Futsal)' }, players: 10 },
    ],
    timeLabel: { en: 'Kickoff', fr: "Coup d'envoi" },
  },
  basketball: {
    players: 10,
    duration: 60,
    formats: [
      { value: '5v5', label: { en: '5 vs 5', fr: '5 contre 5' }, players: 10 },
      { value: '3v3', label: { en: '3 vs 3', fr: '3 contre 3' }, players: 6 },
    ],
    timeLabel: { en: 'Tip-off', fr: 'Entre-deux' },
  },
  badminton: {
    players: 4,
    duration: 60,
    formats: [
      { value: 'singles', label: { en: 'Singles', fr: 'Simple' }, players: 2 },
      { value: 'doubles', label: { en: 'Doubles', fr: 'Double' }, players: 4 },
      { value: 'mixed', label: { en: 'Mixed Doubles', fr: 'Double mixte' }, players: 4 },
    ],
    timeLabel: { en: 'Start Time', fr: 'Heure de début' },
  },
  volleyball: {
    players: 12,
    duration: 90,
    formats: [
      { value: '6v6', label: { en: '6 vs 6', fr: '6 contre 6' }, players: 12 },
      { value: 'beach', label: { en: 'Beach (2v2)', fr: 'Beach (2 contre 2)' }, players: 4 },
    ],
    timeLabel: { en: 'Start Time', fr: 'Heure de début' },
  },
};

// Default for unknown sports
export const DEFAULT_SPORT_CONFIG: SportDefaults = {
  players: 10,
  duration: 90,
  formats: [
    { value: 'standard', label: { en: 'Standard', fr: 'Standard' } },
    { value: 'casual', label: { en: 'Casual', fr: 'Amical' } },
  ],
  timeLabel: { en: 'Start Time', fr: 'Heure de début' },
};

export function getSportDefaults(sportId: string | null | undefined): SportDefaults {
  if (!sportId) return DEFAULT_SPORT_CONFIG;
  return SPORT_DEFAULTS[sportId] || DEFAULT_SPORT_CONFIG;
}

export function getPlayersForFormat(sportId: string | null | undefined, formatValue: string): number | undefined {
  const defaults = getSportDefaults(sportId);
  const format = defaults.formats.find(f => f.value === formatValue);
  return format?.players;
}
