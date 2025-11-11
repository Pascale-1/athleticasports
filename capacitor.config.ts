import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.athletica.sports',
  appName: 'Athletica',
  webDir: 'dist',
  // Temporarily disabled remote server for local testing
  // server: {
  //   url: 'https://cf052cd2-1671-4422-bc90-2b3b42373aba.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    }
  }
};

export default config;
