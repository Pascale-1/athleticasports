/**
 * Returns the base URL for sharing links.
 * Uses VITE_APP_URL env var when set (production), falls back to window.location.origin (dev/preview).
 */
export const getAppBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_APP_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.replace(/\/+$/, '');
  }
  const origin = window.location.origin;
  if (origin.includes('lovableproject.com') || origin.includes('localhost')) {
    return 'https://id-preview--cf052cd2-1671-4422-bc90-2b3b42373aba.lovable.app';
  }
  return origin;
};
