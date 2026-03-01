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
 * Opens an external URL using the most reliable method for the current platform.
 * - Native: Uses Capacitor Browser plugin
 * - Web: Uses anchor click method (most reliable, avoids popup blockers and iframe issues)
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

export const useExternalLink = () => {
  const openExternalUrl = async (url: string) => {
    const normalizedUrl = normalizeUrl(url);
    try {
      if (Capacitor.isNativePlatform()) {
        await Browser.open({ url: normalizedUrl });
      } else {
        openUrlWithAnchor(normalizedUrl);
      }
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
    if (Capacitor.isNativePlatform()) {
      await Browser.open({ url: normalizedUrl });
    } else {
      openUrlWithAnchor(normalizedUrl);
    }
  } catch (error) {
    console.error('Failed to open external URL:', error);
    openUrlWithAnchor(normalizedUrl);
  }
};
