

# Fix: Infinite loading spinner on Android

## Root Cause

In `src/components/ProtectedRoute.tsx`, the `updateUser` function uses a ref (`currentUserIdRef`) to deduplicate auth state changes. However, the ref starts as `null`, and when the user is not logged in, `onAuthStateChange` fires with `session = null`, producing `newId = null`. The check `newId === currentUserIdRef.current` evaluates to `null === null` → `true`, so the function returns early without ever calling `setLoading(false)`.

On the web preview this may not have been noticed because the user was already logged in (localStorage had a session). On a fresh Android install or after clearing data, there is no stored session, so this bug triggers immediately.

## Fix

**File: `src/components/ProtectedRoute.tsx`**

Add a boolean ref `initialCheckDoneRef` to track whether the first auth callback has been processed. On the first call, always proceed regardless of the deduplication check.

```ts
const initialCheckDoneRef = useRef(false);

const updateUser = (sessionUser: User | null) => {
  const newId = sessionUser?.id ?? null;
  // Always process the first callback; deduplicate subsequent ones
  if (initialCheckDoneRef.current && newId === currentUserIdRef.current) return;
  initialCheckDoneRef.current = true;
  currentUserIdRef.current = newId;
  setUser(sessionUser);
  if (!sessionUser) {
    setLoading(false);
    setOnboardingCompleted(null);
    setHasCustomUsername(null);
  }
};
```

This ensures `setLoading(false)` is called on the very first auth event even when the session is null, while still deduplicating subsequent identical callbacks.

### Files changed
- `src/components/ProtectedRoute.tsx` -- fix initial null-session deduplication

