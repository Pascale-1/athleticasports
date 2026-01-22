import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

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
    try {
      if (Capacitor.isNativePlatform()) {
        // Native app: use Capacitor Browser plugin for in-app browser
        await Browser.open({ url });
      } else {
        // Web browser (including iframes): use anchor click method
        // This is more reliable than window.open and avoids cross-origin issues
        openUrlWithAnchor(url);
      }
    } catch (error) {
      console.error('Failed to open external URL:', error);
      // Fallback to anchor click
      openUrlWithAnchor(url);
    }
  };

  return { openExternalUrl };
};

// Standalone function for use outside React components
export const openExternalUrl = async (url: string) => {
  try {
    if (Capacitor.isNativePlatform()) {
      await Browser.open({ url });
    } else {
      openUrlWithAnchor(url);
    }
  } catch (error) {
    console.error('Failed to open external URL:', error);
    openUrlWithAnchor(url);
  }
};
