export const SPORTS = [
  { value: 'football', label: 'Football' },
  { value: 'basketball', label: 'Basketball' },
  { value: 'tennis', label: 'Tennis' },
  { value: 'volleyball', label: 'Volleyball' },
  { value: 'badminton', label: 'Badminton' },
  { value: 'soccer', label: 'Soccer' },
  { value: 'cricket', label: 'Cricket' },
  { value: 'rugby', label: 'Rugby' },
  { value: 'hockey', label: 'Hockey' },
  { value: 'baseball', label: 'Baseball' },
  { value: 'golf', label: 'Golf' },
  { value: 'swimming', label: 'Swimming' },
  { value: 'running', label: 'Running' },
  { value: 'cycling', label: 'Cycling' },
  { value: 'boxing', label: 'Boxing' },
  { value: 'martial_arts', label: 'Martial Arts' },
  { value: 'other', label: 'Other' },
] as const;

export type Sport = typeof SPORTS[number]['value'];
