import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

export const useExternalLink = () => {
  const openExternalUrl = async (url: string) => {
    try {
      if (Capacitor.isNativePlatform()) {
        // Native app: use Capacitor Browser plugin for in-app browser
        await Browser.open({ url });
      } else {
        // Web browser: use standard window.open
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Failed to open external URL:', error);
      // Fallback to window.open
      window.open(url, '_blank');
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
      window.open(url, '_blank');
    }
  } catch (error) {
    console.error('Failed to open external URL:', error);
    window.open(url, '_blank');
  }
};
