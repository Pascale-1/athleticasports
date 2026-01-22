// Map provider utilities for opening locations in various map applications

export type MapProvider = 'openstreetmap' | 'google' | 'apple' | 'waze';

export interface MapProviderOption {
  id: MapProvider;
  name: string;
  getUrl: (address: string) => string;
}

export const MAP_PROVIDERS: MapProviderOption[] = [
  {
    id: 'openstreetmap',
    name: 'OpenStreetMap',
    getUrl: (address: string) => 
      `https://www.openstreetmap.org/search?query=${encodeURIComponent(address)}`,
  },
  {
    id: 'google',
    name: 'Google Maps',
    getUrl: (address: string) => 
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
  },
  {
    id: 'apple',
    name: 'Apple Maps',
    getUrl: (address: string) => 
      `https://maps.apple.com/?q=${encodeURIComponent(address)}`,
  },
  {
    id: 'waze',
    name: 'Waze',
    getUrl: (address: string) => 
      `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`,
  },
];

export const getMapProviderUrl = (provider: MapProvider, address: string): string => {
  const providerConfig = MAP_PROVIDERS.find(p => p.id === provider);
  return providerConfig ? providerConfig.getUrl(address) : MAP_PROVIDERS[0].getUrl(address);
};

// Default provider is OpenStreetMap (doesn't get blocked like Google)
export const getDefaultMapUrl = (address: string): string => {
  return getMapProviderUrl('openstreetmap', address);
};
