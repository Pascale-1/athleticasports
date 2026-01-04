export interface Sport {
  id: string;
  label: {
    en: string;
    fr: string;
  };
  emoji: string;
  priority: number;
  featured: boolean;
}

export const SPORTS: Sport[] = [
  // Featured (France focus) - Padel and Tennis first
  { id: 'padel', label: { en: 'Padel', fr: 'Padel' }, emoji: '🎾', priority: 1, featured: true },
  { id: 'tennis', label: { en: 'Tennis', fr: 'Tennis' }, emoji: '🎾', priority: 2, featured: true },
  
  // Popular in France
  { id: 'football', label: { en: 'Soccer', fr: 'Football' }, emoji: '⚽', priority: 3, featured: false },
  { id: 'basketball', label: { en: 'Basketball', fr: 'Basketball' }, emoji: '🏀', priority: 4, featured: false },
  { id: 'badminton', label: { en: 'Badminton', fr: 'Badminton' }, emoji: '🏸', priority: 5, featured: false },
  { id: 'volleyball', label: { en: 'Volleyball', fr: 'Volley-ball' }, emoji: '🏐', priority: 6, featured: false },
  
  // Other sports
  { id: 'running', label: { en: 'Running', fr: 'Course' }, emoji: '🏃', priority: 7, featured: false },
  { id: 'rugby', label: { en: 'Rugby', fr: 'Rugby' }, emoji: '🏉', priority: 8, featured: false },
  { id: 'squash', label: { en: 'Squash', fr: 'Squash' }, emoji: '🎾', priority: 9, featured: false },
  { id: 'swimming', label: { en: 'Swimming', fr: 'Natation' }, emoji: '🏊', priority: 10, featured: false },
  { id: 'cycling', label: { en: 'Cycling', fr: 'Cyclisme' }, emoji: '🚴', priority: 11, featured: false },
  { id: 'boxing', label: { en: 'Boxing', fr: 'Boxe' }, emoji: '🥊', priority: 12, featured: false },
  { id: 'other', label: { en: 'Other', fr: 'Autre' }, emoji: '🏅', priority: 99, featured: false },
];

// Get a sport by ID
export const getSportById = (id: string): Sport | undefined => 
  SPORTS.find(s => s.id.toLowerCase() === id.toLowerCase());

// Get localized label for a sport
export const getSportLabel = (id: string, lang: 'en' | 'fr' = 'fr'): string => {
  const sport = getSportById(id);
  if (!sport) return id;
  return sport.label[lang];
};

// Get sport with emoji
export const getSportWithEmoji = (id: string, lang: 'en' | 'fr' = 'fr'): string => {
  const sport = getSportById(id);
  if (!sport) return id;
  return `${sport.emoji} ${sport.label[lang]}`;
};

// Get all active sports sorted by priority
export const getActiveSports = (): Sport[] => 
  [...SPORTS].sort((a, b) => a.priority - b.priority);

// Get featured sports (Padel, Tennis)
export const getFeaturedSports = (): Sport[] => 
  SPORTS.filter(s => s.featured).sort((a, b) => a.priority - b.priority);

// Get non-featured sports
export const getRegularSports = (): Sport[] => 
  SPORTS.filter(s => !s.featured).sort((a, b) => a.priority - b.priority);

// Get sports formatted for dropdown/select components
export const getSportsForDropdown = (lang: 'en' | 'fr' = 'fr'): { value: string; label: string; emoji: string; featured: boolean }[] => 
  getActiveSports().map(s => ({
    value: s.id,
    label: s.label[lang],
    emoji: s.emoji,
    featured: s.featured,
  }));

// Get sports for filter buttons (includes "All" option)
export const getSportsForFilter = (lang: 'en' | 'fr' = 'fr', includeAll = true): string[] => {
  const sports = getActiveSports().map(s => s.label[lang]);
  return includeAll ? [lang === 'fr' ? 'Tous' : 'All', ...sports] : sports;
};

// Get sport IDs for filter (includes "All" option)
export const getSportIdsForFilter = (includeAll = true): string[] => {
  const ids = getActiveSports().map(s => s.id);
  return includeAll ? ['all', ...ids] : ids;
};

// Legacy support - old format { value, label }
export const getSportsLegacy = (): { value: string; label: string }[] =>
  getActiveSports().map(s => ({ value: s.id, label: s.label.en }));

export type SportId = typeof SPORTS[number]['id'];
