

# Fix: Stale session after background on Android

## Problem
In `ProtectedRoute.tsx`, the visibility-change handler (lines 47-54) only processes sessions when `session?.user` is truthy. If the session expires while the app is in the background, coming back does nothing -- the component still holds the old `user` state, so the UI appears logged in but all backend calls fail with auth errors.

## Fix

**File: `src/components/ProtectedRoute.tsx`** (lines 47-54)

Update the visibility handler to always call `updateUser`, even when the session is null. This way, an expired session will correctly redirect to `/auth`.

```tsx
const handleVisibility = () => {
  if (document.visibilityState === 'visible') {
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateUser(session?.user ?? null);
    });
  }
};
```

The only change is removing the `if (session?.user)` guard and always passing the result to `updateUser`. The deduplication logic already handles the case where the session hasn't changed.

### Files changed
- `src/components/ProtectedRoute.tsx` -- visibility handler always syncs session state

