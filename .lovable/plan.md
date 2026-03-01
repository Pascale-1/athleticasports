

# Fix: Username Selection Screen Appearing Twice

## Root Cause

When the user completes onboarding and navigates to `/`, the `ProtectedRoute` mounts and receives two `user` state updates in quick succession:
1. From `onAuthStateChange` callback
2. From `getSession().then()`

Each triggers the `checkProfile` effect independently, causing a double redirect to `/choose-username`. Additionally, after confirming the username and navigating back to `/`, a new `ProtectedRoute` instance is created with fresh refs (caching lost), and the same double-fire can briefly show the screen again.

## Fix

Two changes in `src/components/ProtectedRoute.tsx`:

1. **Deduplicate user state updates** — track the current user ID in a ref and only call `setUser` when the ID actually changes. This prevents the profile check effect from running twice on mount.

2. **Persist username cache across route navigations** — use `sessionStorage` instead of a component-scoped ref for the `usernameCachedRef`, so that once the username is confirmed on `/choose-username`, the redirect guard on `/` immediately knows to skip the check.

### Files modified
1. `src/components/ProtectedRoute.tsx` — deduplicate user updates + persist username cache in sessionStorage

