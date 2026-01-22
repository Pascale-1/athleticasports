import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

// Check if running inside an iframe (like Lovable preview)
const isInIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true; // If access is denied, we're likely in a cross-origin iframe
  }
};

export const useExternalLink = () => {
  const openExternalUrl = async (url: string) => {
    try {
      if (Capacitor.isNativePlatform()) {
        // Native app: use Capacitor Browser plugin for in-app browser
        await Browser.open({ url });
      } else if (isInIframe() && window.top) {
        // Running in iframe (like Lovable preview): open in parent/top window
        window.top.open(url, '_blank');
      } else {
        // Standard web browser: use window.open
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Failed to open external URL:', error);
      // Ultimate fallback - create a temporary link and click it
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return { openExternalUrl };
};

// Standalone function for use outside React components
export const openExternalUrl = async (url: string) => {
  try {
    if (Capacitor.isNativePlatform()) {
      await Browser.open({ url });
    } else if (isInIframe() && window.top) {
      window.top.open(url, '_blank');
    } else {
      window.open(url, '_blank');
    }
  } catch (error) {
    console.error('Failed to open external URL:', error);
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
