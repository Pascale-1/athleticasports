import { PARIS_DISTRICTS, NEARBY_CITIES, District } from "./parisDistricts";

export interface MatchScore {
  total: number; // 0-100
  breakdown: {
    sport: number;      // 0-30 (exact = 30)
    location: number;   // 0-25 (same district = 25, adjacent = 15, same zone = 10, city = 5)
    time: number;       // 0-25 (overlap percentage)
    skill: number;      // 0-20 (±1 level = 20, ±2 = 10)
  };
  label: 'perfect' | 'great' | 'good' | 'fair';
}

// District adjacency map for Paris (simplified - districts that share borders)
const DISTRICT_ADJACENCY: Record<string, string[]> = {
  '75001': ['75002', '75003', '75004', '75006', '75007', '75008', '75009'],
  '75002': ['75001', '75003', '75009', '75010'],
  '75003': ['75001', '75002', '75004', '75010', '75011'],
  '75004': ['75001', '75003', '75005', '75011', '75012'],
  '75005': ['75004', '75006', '75013', '75014'],
  '75006': ['75001', '75005', '75007', '75014', '75015'],
  '75007': ['75001', '75006', '75008', '75015', '75016'],
  '75008': ['75001', '75007', '75009', '75016', '75017'],
  '75009': ['75001', '75002', '75008', '75010', '75017', '75018'],
  '75010': ['75002', '75003', '75009', '75011', '75018', '75019'],
  '75011': ['75003', '75004', '75010', '75012', '75019', '75020'],
  '75012': ['75004', '75011', '75013', '75020', 'vincennes', 'saint-mande'],
  '75013': ['75005', '75012', '75014'],
  '75014': ['75005', '75006', '75013', '75015'],
  '75015': ['75006', '75007', '75014', '75016', 'issy', 'boulogne'],
  '75016': ['75007', '75008', '75015', '75017', 'boulogne', 'neuilly'],
  '75017': ['75008', '75009', '75016', '75018', 'levallois', 'clichy', 'neuilly'],
  '75018': ['75009', '75010', '75017', '75019', 'saint-denis', 'clichy'],
  '75019': ['75010', '75011', '75018', '75020', 'pantin'],
  '75020': ['75011', '75012', '75019', 'montreuil'],
  // Banlieue
  'boulogne': ['75015', '75016', 'issy'],
  'levallois': ['75017', 'neuilly', 'clichy'],
  'neuilly': ['75016', '75017', 'levallois'],
  'issy': ['75015', 'boulogne'],
  'vincennes': ['75012', 'saint-mande', 'montreuil'],
  'saint-mande': ['75012', 'vincennes'],
  'montreuil': ['75020', 'vincennes'],
  'saint-denis': ['75018', 'pantin'],
  'pantin': ['75019', 'saint-denis'],
  'clichy': ['75017', '75018', 'levallois'],
};

// Get zone for a district
const getDistrictZone = (districtId: string): District['zone'] | null => {
  const allDistricts = [...PARIS_DISTRICTS, ...NEARBY_CITIES];
  const district = allDistricts.find(d => d.id === districtId);
  return district?.zone || null;
};

// Check if two districts are adjacent
export const areDistrictsAdjacent = (d1: string, d2: string): boolean => {
  if (!d1 || !d2) return false;
  const adjacentList = DISTRICT_ADJACENCY[d1] || [];
  return adjacentList.includes(d2);
};

// Check if two districts are in the same zone
export const areDistrictsSameZone = (d1: string, d2: string): boolean => {
  if (!d1 || !d2) return false;
  const zone1 = getDistrictZone(d1);
  const zone2 = getDistrictZone(d2);
  return zone1 !== null && zone1 === zone2;
};

// Calculate location score
export const calculateLocationScore = (
  playerDistrict: string | null,
  eventDistrict: string | null
): number => {
  if (!playerDistrict || !eventDistrict) return 15; // No location preference = neutral match
  
  if (playerDistrict === eventDistrict) return 25; // Same district
  if (areDistrictsAdjacent(playerDistrict, eventDistrict)) return 18; // Adjacent
  if (areDistrictsSameZone(playerDistrict, eventDistrict)) return 12; // Same zone
  return 5; // Different zones but still in Paris area
};

// Calculate time overlap score
export const calculateTimeScore = (
  availableFrom: string,
  availableUntil: string,
  eventStart: string,
  eventEnd: string
): number => {
  const availFrom = new Date(availableFrom).getTime();
  const availUntil = new Date(availableUntil).getTime();
  const eventStartTime = new Date(eventStart).getTime();
  const eventEndTime = new Date(eventEnd).getTime();
  
  // Event must be within availability window
  if (eventStartTime < availFrom || eventStartTime > availUntil) {
    return 0;
  }
  
  // Calculate how centered the event is in the availability window
  const availWindow = availUntil - availFrom;
  const eventMidpoint = (eventStartTime + eventEndTime) / 2;
  const availMidpoint = (availFrom + availUntil) / 2;
  const distanceFromCenter = Math.abs(eventMidpoint - availMidpoint);
  const maxDistance = availWindow / 2;
  
  // Score from 15-25 based on how centered the event is
  const centerScore = maxDistance > 0 
    ? Math.round(25 - (distanceFromCenter / maxDistance) * 10)
    : 25;
  
  return Math.max(15, Math.min(25, centerScore));
};

// Calculate skill level score
export const calculateSkillScore = (
  playerSkill: number | null,
  eventSkillMin: number | null,
  eventSkillMax: number | null
): number => {
  // No skill requirements or no player skill = neutral match
  if (!playerSkill) return 15;
  if (!eventSkillMin && !eventSkillMax) return 15;
  
  const minLevel = eventSkillMin || 1;
  const maxLevel = eventSkillMax || 5;
  
  // Perfect match if within range
  if (playerSkill >= minLevel && playerSkill <= maxLevel) {
    return 20;
  }
  
  // Calculate distance from acceptable range
  const distanceFromRange = playerSkill < minLevel 
    ? minLevel - playerSkill 
    : playerSkill - maxLevel;
  
  // Score decreases with distance
  if (distanceFromRange === 1) return 10;
  if (distanceFromRange === 2) return 5;
  return 0; // Too far from range
};

// Calculate sport match score
export const calculateSportScore = (
  playerSport: string,
  eventSport: string | null
): number => {
  if (!eventSport) return 0; // No sport on event = no match
  if (playerSport.toLowerCase() === eventSport.toLowerCase()) return 30;
  return 0; // No partial matching for now
};

// Calculate full match score
export const calculateMatchScore = (
  playerAvailability: {
    sport: string;
    available_from: string;
    available_until: string;
    location_district?: string | null;
    skill_level?: number | null;
  },
  event: {
    sport?: string | null;
    start_time: string;
    end_time: string;
    location_district?: string | null;
    skill_level_min?: number | null;
    skill_level_max?: number | null;
  }
): MatchScore => {
  const sportScore = calculateSportScore(playerAvailability.sport, event.sport || null);
  const locationScore = calculateLocationScore(
    playerAvailability.location_district || null,
    event.location_district || null
  );
  const timeScore = calculateTimeScore(
    playerAvailability.available_from,
    playerAvailability.available_until,
    event.start_time,
    event.end_time
  );
  const skillScore = calculateSkillScore(
    playerAvailability.skill_level || null,
    event.skill_level_min || null,
    event.skill_level_max || null
  );
  
  const total = sportScore + locationScore + timeScore + skillScore;
  
  // Determine label
  let label: MatchScore['label'];
  if (total >= 85) label = 'perfect';
  else if (total >= 70) label = 'great';
  else if (total >= 50) label = 'good';
  else label = 'fair';
  
  return {
    total,
    breakdown: {
      sport: sportScore,
      location: locationScore,
      time: timeScore,
      skill: skillScore,
    },
    label,
  };
};

// Get label translation key
export const getMatchLabelKey = (label: MatchScore['label']): string => {
  const keys: Record<MatchScore['label'], string> = {
    perfect: 'matching.labels.perfect',
    great: 'matching.labels.great',
    good: 'matching.labels.good',
    fair: 'matching.labels.fair',
  };
  return keys[label];
};

// Get badge color for match score
export const getMatchBadgeVariant = (label: MatchScore['label']): 'default' | 'secondary' | 'outline' => {
  switch (label) {
    case 'perfect':
    case 'great':
      return 'default';
    case 'good':
      return 'secondary';
    default:
      return 'outline';
  }
};
