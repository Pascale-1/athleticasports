/**
 * Returns an emoji icon for the given event type.
 * - match   → 🏆 (or sport-specific if sport is provided)
 * - training → 🏃
 * - meetup   → 🤝
 * - default  → 📅
 */
export const getEventTypeEmoji = (type: string, sport?: string | null): string => {
  switch (type) {
    case 'match': {
      if (!sport) return '🏆';
      const s = sport.toLowerCase();
      if (s.includes('football') || s.includes('soccer')) return '⚽';
      if (s.includes('basketball') || s.includes('basket')) return '🏀';
      if (s.includes('tennis')) return '🎾';
      if (s.includes('volleyball') || s.includes('volley')) return '🏐';
      if (s.includes('rugby')) return '🏉';
      if (s.includes('handball') || s.includes('hand')) return '🤾';
      if (s.includes('baseball')) return '⚾';
      if (s.includes('badminton') || s.includes('ping') || s.includes('table')) return '🏓';
      if (s.includes('hockey')) return '🏒';
      if (s.includes('cricket')) return '🏏';
      if (s.includes('swim') || s.includes('natation')) return '🏊';
      if (s.includes('cycling') || s.includes('vélo') || s.includes('bike')) return '🚴';
      if (s.includes('golf')) return '⛳';
      if (s.includes('box')) return '🥊';
      return '🏆';
    }
    case 'training':
      return '🏃';
    case 'meetup':
      return '🤝';
    default:
      return '📅';
  }
};
