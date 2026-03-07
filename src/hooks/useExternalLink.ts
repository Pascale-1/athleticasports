import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

const normalizeUrl = (url: string): string => {
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

/**
 * Attempts to convert a web URL into a native app URI scheme.
 * Returns the native URI if matched, or null to fall back to default behavior.
 */
const getNativeIntentUrl = (url: string): string | null => {
  if (!Capacitor.isNativePlatform()) return null;

  const platform = Capacitor.getPlatform();

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    // WhatsApp
    if (host === 'wa.me' || host === 'api.whatsapp.com') {
      const text = parsed.searchParams.get('text') || parsed.pathname.slice(1);
      if (host === 'wa.me' && parsed.searchParams.get('text')) {
        return `whatsapp://send?text=${encodeURIComponent(parsed.searchParams.get('text')!)}`;
      }
      return `whatsapp://send?text=${encodeURIComponent(text)}`;
    }

    // Waze
    if (host === 'waze.com' || host === 'www.waze.com') {
      const q = parsed.searchParams.get('q') || '';
      return `waze://?q=${encodeURIComponent(q)}&navigate=yes`;
    }

    // Google Maps
    if ((host === 'www.google.com' || host === 'google.com' || host === 'maps.google.com') 
        && parsed.pathname.includes('/maps')) {
      const query = parsed.searchParams.get('query') || parsed.searchParams.get('q') || '';
      if (platform === 'ios') {
        return `comgooglemaps://?q=${encodeURIComponent(query)}`;
      }
      if (platform === 'android') {
        return `geo:0,0?q=${encodeURIComponent(query)}`;
      }
    }
  } catch {
    // URL parsing failed, fall back
  }

  return null;
};

/**
 * Opens a URL using native intent if available, otherwise via Capacitor Browser or anchor.
 */
const openUrlWithAnchor = (url: string): void => {
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const openWithNativeIntentOrFallback = async (url: string): Promise<void> => {
  const nativeIntent = getNativeIntentUrl(url);
  if (nativeIntent) {
    // Use window.location.href for native URI schemes — this triggers OS intent resolution
    window.location.href = nativeIntent;
    return;
  }

  // Default: Capacitor Browser on native, anchor on web
  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url });
  } else {
    openUrlWithAnchor(url);
  }
};

export const useExternalLink = () => {
  const openExternalUrl = async (url: string) => {
    const normalizedUrl = normalizeUrl(url);
    try {
      await openWithNativeIntentOrFallback(normalizedUrl);
    } catch (error) {
      console.error('Failed to open external URL:', error);
      openUrlWithAnchor(normalizedUrl);
    }
  };

  return { openExternalUrl };
};

// Standalone function for use outside React components
export const openExternalUrl = async (url: string) => {
  const normalizedUrl = normalizeUrl(url);
  try {
    await openWithNativeIntentOrFallback(normalizedUrl);
  } catch (error) {
    console.error('Failed to open external URL:', error);
    openUrlWithAnchor(normalizedUrl);
  }
};
