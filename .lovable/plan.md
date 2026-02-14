
# Fix Password Reset Email Link

## Problem

When a user clicks "Forgot password?" on the login page (or "Change password" in settings), an email is sent successfully. However, clicking the link in the email does not work as expected -- the user should land on the `/reset-password` page to set a new password.

There are two issues causing this:

### Issue 1: Redirect URL mismatch

The `redirectTo` in `resetPasswordForEmail` is set to `${window.location.origin}/reset-password`. However, when the email is sent from the **preview** environment, the origin is a dynamic Lovable preview URL that may not be in the backend's list of allowed redirect URLs. The backend may silently ignore or rewrite the redirect to the configured site URL, so the user never lands on `/reset-password`.

**Fix:** Use the published/primary domain if available, or ensure the redirect URL is properly configured. Since the preview URL is dynamic, the best fix is to ensure the redirect goes to a working URL and the route handles the callback correctly.

### Issue 2: Race condition with ProtectedRoute and Auth page

When the password recovery link lands on `/reset-password`, the Supabase client processes the hash fragment (`#access_token=...&type=recovery`) and fires a `PASSWORD_RECOVERY` auth event. However, the Auth page's `onAuthStateChange` listener (if the user happens to be redirected there) or any other global auth listener could detect the new session first and redirect the user to `/` before the ResetPassword page has a chance to show.

Additionally, in `ResetPassword.tsx`, if `getSession()` resolves before the `PASSWORD_RECOVERY` event fires, the page sets `isReady = true`, but the user might then get redirected away by a global auth listener.

## Solution

### 1. Add `/reset-password` hash handling in main app entry

In `src/App.tsx` or `src/main.tsx`, add early detection of the password recovery hash fragment. When the URL contains `type=recovery` in the hash, ensure the app navigates to `/reset-password` before any ProtectedRoute can intercept.

### 2. Update ResetPassword page to be more resilient

- Parse the URL hash fragment directly as a fallback to detect recovery mode
- Add a timeout fallback so the page doesn't spin forever
- Handle the case where the user arrives with a valid recovery token in the URL

### 3. Ensure the redirect URL uses the correct origin

Both `Auth.tsx` (`handleForgotPassword`) and `ChangePasswordSection.tsx` already use `window.location.origin`, which is correct. The key issue is making sure the backend allows this redirect.

## Files to change

| File | Change |
|------|--------|
| `src/App.tsx` | Add a redirect from `/` to `/reset-password` when URL hash contains `type=recovery` |
| `src/pages/ResetPassword.tsx` | Add hash fragment parsing fallback, timeout for spinner, and better error handling |
| `vite.config.ts` | Add `/reset-password` related paths to PWA `navigateFallbackDenylist` if needed |

## Technical Details

### src/App.tsx
Add an early `useEffect` in the App component that checks `window.location.hash` for `type=recovery`. If found, redirect to `/reset-password` with the hash preserved:

```typescript
useEffect(() => {
  const hash = window.location.hash;
  if (hash && hash.includes('type=recovery')) {
    const currentPath = window.location.pathname;
    if (currentPath !== '/reset-password') {
      window.location.href = '/reset-password' + hash;
    }
  }
}, []);
```

### src/pages/ResetPassword.tsx
- Add a fallback that checks `window.location.hash` for recovery tokens
- Add a 10-second timeout that shows an error message instead of infinite spinner
- Prevent the global auth listener from redirecting away by marking the recovery state in sessionStorage
