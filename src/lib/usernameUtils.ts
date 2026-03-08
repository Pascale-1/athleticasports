/**
 * Checks if a username is a system-generated UID (e.g. "user_245bc703").
 */
export const isSystemUsername = (username?: string | null): boolean =>
  !username || /^user_[0-9a-f]+$/i.test(username);

/**
 * Returns a friendly display username.
 * - If the user has a custom username → returns it as-is
 * - If the username is a system UID → derives "FirstnameL" from display_name
 * - Falls back to the raw username if no name is available
 */
export const getFriendlyUsername = (
  username: string,
  displayName?: string | null,
): string => {
  if (!isSystemUsername(username)) return username;

  if (!displayName) return username;

  const parts = displayName.trim().split(/\s+/);
  if (parts.length > 1) {
    return parts[0] + parts[parts.length - 1][0].toUpperCase();
  }
  return parts[0];
};

/**
 * Returns the friendly username prefixed with "@".
 */
export const getDisplayUsername = (
  username: string,
  displayName?: string | null,
): string => `@${getFriendlyUsername(username, displayName)}`;
