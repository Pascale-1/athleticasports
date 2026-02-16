/**
 * Returns the base URL for sharing links.
 * Uses VITE_APP_URL env var when set (production), falls back to window.location.origin (dev/preview).
 */
export const getAppBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_APP_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.replace(/\/+$/, ''); // Remove trailing slashes
  }
  return window.location.origin;
};
