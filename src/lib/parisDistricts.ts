export interface District {
  id: string;
  name: string;
  nameFr: string;
  zone: 'centre' | 'rive_droite' | 'rive_gauche' | 'banlieue';
  neighborhoods: string[];
}

export const PARIS_DISTRICTS: District[] = [
  // Centre
  { id: '75001', name: '1st', nameFr: '1er - Louvre', zone: 'centre', neighborhoods: ['Châtelet', 'Les Halles', 'Palais Royal'] },
  { id: '75002', name: '2nd', nameFr: '2e - Bourse', zone: 'centre', neighborhoods: ['Sentier', 'Montorgueil'] },
  { id: '75003', name: '3rd', nameFr: '3e - Temple', zone: 'centre', neighborhoods: ['Marais Nord', 'Arts et Métiers'] },
  { id: '75004', name: '4th', nameFr: '4e - Hôtel de Ville', zone: 'centre', neighborhoods: ['Marais', 'Île Saint-Louis', 'Bastille'] },
  
  // Rive Droite
  { id: '75008', name: '8th', nameFr: '8e - Élysée', zone: 'rive_droite', neighborhoods: ['Champs-Élysées', 'Madeleine', 'Étoile'] },
  { id: '75009', name: '9th', nameFr: '9e - Opéra', zone: 'rive_droite', neighborhoods: ['Opéra', 'Pigalle', 'Grands Boulevards'] },
  { id: '75010', name: '10th', nameFr: '10e - Entrepôt', zone: 'rive_droite', neighborhoods: ['Canal Saint-Martin', 'Gare du Nord', 'Gare de l\'Est'] },
  { id: '75011', name: '11th', nameFr: '11e - Popincourt', zone: 'rive_droite', neighborhoods: ['Oberkampf', 'Bastille', 'République'] },
  { id: '75012', name: '12th', nameFr: '12e - Reuilly', zone: 'rive_droite', neighborhoods: ['Bercy', 'Nation', 'Bois de Vincennes'] },
  { id: '75016', name: '16th', nameFr: '16e - Passy', zone: 'rive_droite', neighborhoods: ['Trocadéro', 'Auteuil', 'Bois de Boulogne'] },
  { id: '75017', name: '17th', nameFr: '17e - Batignolles', zone: 'rive_droite', neighborhoods: ['Batignolles', 'Ternes', 'Épinettes'] },
  { id: '75018', name: '18th', nameFr: '18e - Montmartre', zone: 'rive_droite', neighborhoods: ['Montmartre', 'Clignancourt', 'La Chapelle'] },
  { id: '75019', name: '19th', nameFr: '19e - Buttes-Chaumont', zone: 'rive_droite', neighborhoods: ['Buttes-Chaumont', 'La Villette', 'Belleville'] },
  { id: '75020', name: '20th', nameFr: '20e - Ménilmontant', zone: 'rive_droite', neighborhoods: ['Belleville', 'Père Lachaise', 'Gambetta'] },
  
  // Rive Gauche
  { id: '75005', name: '5th', nameFr: '5e - Panthéon', zone: 'rive_gauche', neighborhoods: ['Quartier Latin', 'Mouffetard', 'Jardin des Plantes'] },
  { id: '75006', name: '6th', nameFr: '6e - Luxembourg', zone: 'rive_gauche', neighborhoods: ['Saint-Germain', 'Odéon', 'Luxembourg'] },
  { id: '75007', name: '7th', nameFr: '7e - Palais-Bourbon', zone: 'rive_gauche', neighborhoods: ['Tour Eiffel', 'Invalides', 'Musée d\'Orsay'] },
  { id: '75013', name: '13th', nameFr: '13e - Gobelins', zone: 'rive_gauche', neighborhoods: ['Bibliothèque', 'Chinatown', 'Butte-aux-Cailles'] },
  { id: '75014', name: '14th', nameFr: '14e - Observatoire', zone: 'rive_gauche', neighborhoods: ['Montparnasse', 'Denfert', 'Alésia'] },
  { id: '75015', name: '15th', nameFr: '15e - Vaugirard', zone: 'rive_gauche', neighborhoods: ['Montparnasse', 'Javel', 'Grenelle'] },
];

export const NEARBY_CITIES: District[] = [
  { id: 'boulogne', name: 'Boulogne-Billancourt', nameFr: 'Boulogne-Billancourt', zone: 'banlieue', neighborhoods: [] },
  { id: 'levallois', name: 'Levallois-Perret', nameFr: 'Levallois-Perret', zone: 'banlieue', neighborhoods: [] },
  { id: 'neuilly', name: 'Neuilly-sur-Seine', nameFr: 'Neuilly-sur-Seine', zone: 'banlieue', neighborhoods: [] },
  { id: 'issy', name: 'Issy-les-Moulineaux', nameFr: 'Issy-les-Moulineaux', zone: 'banlieue', neighborhoods: [] },
  { id: 'vincennes', name: 'Vincennes', nameFr: 'Vincennes', zone: 'banlieue', neighborhoods: [] },
  { id: 'saint-mande', name: 'Saint-Mandé', nameFr: 'Saint-Mandé', zone: 'banlieue', neighborhoods: [] },
  { id: 'montreuil', name: 'Montreuil', nameFr: 'Montreuil', zone: 'banlieue', neighborhoods: [] },
  { id: 'saint-denis', name: 'Saint-Denis', nameFr: 'Saint-Denis', zone: 'banlieue', neighborhoods: [] },
  { id: 'pantin', name: 'Pantin', nameFr: 'Pantin', zone: 'banlieue', neighborhoods: [] },
  { id: 'clichy', name: 'Clichy', nameFr: 'Clichy', zone: 'banlieue', neighborhoods: [] },
];

export const getAllDistricts = (): District[] => [...PARIS_DISTRICTS, ...NEARBY_CITIES];

export const getDistrictById = (id: string): District | undefined => 
  getAllDistricts().find(d => d.id === id);

export const getDistrictsByZone = (zone: District['zone']): District[] =>
  getAllDistricts().filter(d => d.zone === zone);

export const getDistrictLabel = (id: string, lang: 'en' | 'fr' = 'fr'): string => {
  const district = getDistrictById(id);
  if (!district) return id;
  return lang === 'fr' ? district.nameFr : district.name;
};

export const ZONE_LABELS = {
  centre: { en: 'Paris Centre', fr: 'Paris Centre' },
  rive_droite: { en: 'Right Bank', fr: 'Rive Droite' },
  rive_gauche: { en: 'Left Bank', fr: 'Rive Gauche' },
  banlieue: { en: 'Nearby Cities', fr: 'Proche Banlieue' },
} as const;
