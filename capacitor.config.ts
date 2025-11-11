import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.cf052cd216714422bc902b3b42373aba',
  appName: 'Athletica',
  webDir: 'dist',
  server: {
    url: 'https://cf052cd2-1671-4422-bc90-2b3b42373aba.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
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
