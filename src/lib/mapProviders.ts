// Map provider utilities for opening locations in various map applications
import { Capacitor } from '@capacitor/core';

export type MapProvider = 'openstreetmap' | 'google' | 'apple' | 'waze';

export interface MapProviderOption {
  id: MapProvider;
  name: string;
  getUrl: (address: string) => string;
  /** Returns a native URI scheme URL if on a native platform, or null to use web URL */
  getNativeUrl?: (address: string) => string | null;
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
    getNativeUrl: (address: string) => {
      if (!Capacitor.isNativePlatform()) return null;
      const platform = Capacitor.getPlatform();
      if (platform === 'ios') {
        return `comgooglemaps://?q=${encodeURIComponent(address)}`;
      }
      if (platform === 'android') {
        return `geo:0,0?q=${encodeURIComponent(address)}`;
      }
      return null;
    },
  },
  {
    id: 'apple',
    name: 'Apple Maps',
    getUrl: (address: string) => 
      `https://maps.apple.com/?q=${encodeURIComponent(address)}`,
    getNativeUrl: (address: string) => {
      if (!Capacitor.isNativePlatform()) return null;
      if (Capacitor.getPlatform() === 'ios') {
        return `maps://maps.apple.com/?q=${encodeURIComponent(address)}`;
      }
      return null;
    },
  },
  {
    id: 'waze',
    name: 'Waze',
    getUrl: (address: string) => 
      `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`,
    getNativeUrl: (address: string) => {
      if (!Capacitor.isNativePlatform()) return null;
      return `waze://?q=${encodeURIComponent(address)}&navigate=yes`;
    },
  },
];

export const getMapProviderUrl = (provider: MapProvider, address: string): string => {
  const providerConfig = MAP_PROVIDERS.find(p => p.id === provider);
  return providerConfig ? providerConfig.getUrl(address) : MAP_PROVIDERS[0].getUrl(address);
};

/**
 * Returns the best URL for a map provider — native URI scheme if available, otherwise web URL.
 */
export const getBestMapUrl = (provider: MapProviderOption, address: string): string => {
  if (Capacitor.isNativePlatform() && provider.getNativeUrl) {
    const nativeUrl = provider.getNativeUrl(address);
    if (nativeUrl) return nativeUrl;
  }
  return provider.getUrl(address);
};

// Default provider is OpenStreetMap (doesn't get blocked like Google)
export const getDefaultMapUrl = (address: string): string => {
  return getMapProviderUrl('openstreetmap', address);
};

/**
 * Returns a native-friendly map URL that opens the device's maps app.
 * - iOS: maps:// scheme opens Apple Maps natively
 * - Android: geo: intent opens the default maps app
 * - Web: Falls back to Google Maps web URL
 */
export const getNativeMapUrl = (address: string): string => {
  if (Capacitor.isNativePlatform()) {
    const platform = Capacitor.getPlatform();
    if (platform === 'ios') {
      return `maps://maps.apple.com/?q=${encodeURIComponent(address)}`;
    }
    if (platform === 'android') {
      return `geo:0,0?q=${encodeURIComponent(address)}`;
    }
  }
  // Web fallback — use Google Maps which handles redirect well
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
};
