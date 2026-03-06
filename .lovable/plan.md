

# Profile Section Fixes — Implementation Plan

## Issues and Fixes

### 1. Share Profile button not working
**Root cause**: `handleShare` in `Settings.tsx` uses `window.location.href` which inside the Lovable preview iframe returns the iframe URL, not the app URL. Also, `navigator.share` / `navigator.clipboard` fail silently in iframes.
**Fix**: Use `getAppBaseUrl()` to construct a proper shareable URL (`${getAppBaseUrl()}/users?user=${profile.user_id}`). Use a try/catch fallback for clipboard that creates a temporary textarea element if `navigator.clipboard` is blocked.

### 2. Share event link from profile broken
**Root cause**: Same clipboard issue. The `EventInviteLink` component uses `navigator.clipboard.writeText()` which can fail in iframe/native contexts.
**Fix**: Add the same clipboard fallback utility (textarea method) to `EventInviteLink.tsx`'s `copyToClipboard`.

### 3. Photo upload failing
**Root cause**: The storage RLS policy for uploads checks `(auth.uid())::text = (storage.foldername(name))[1]`, meaning the file must be inside a folder named after the user's ID (e.g., `{userId}/avatar.jpg`). But the current code uploads to a flat path: `${user_id}-${random}.${ext}` — no folder, so the policy rejects it.
**Fix**: Change the upload path in `Settings.tsx` to `${profile.user_id}/${Date.now()}.${fileExt}` so it sits inside a user-ID folder matching the RLS policy.

### 4. Profile stats incorrect
**Root cause**: The `ProfileStats` component queries `event_attendance` for all events with status `attending`. The RLS policy requires the user to be a team member or the event to be public to see attendance records. For private team events the user left, their own attendance records become invisible. The count query returns `null` (not the true count) when RLS blocks rows.
**Fix**: The stats query itself looks correct for active data. The likely issue is that `count` returns `null` when an error occurs. Add proper error handling and ensure we use the user's own ID (which the RLS allows for `team_members` via the self-select policy). No schema change needed — just add `.eq('user_id', userId)` filtering which already exists. The real fix is to also check `teamsRes.error` and `eventsRes.error` and log them.

### 5. Two logout buttons
**Root cause**: There's a `LogoutButton` inside `ProfileTabs` settings tab (line 326-330) AND another one in the parent `Settings.tsx` (line 305-307).
**Fix**: Remove the standalone `LogoutButton` card from `Settings.tsx` (lines 305-307). Keep the one inside ProfileTabs settings tab since it's contextually grouped with other settings.

### 6. Reset password email link not clickable
**Root cause**: The edge function builds `appResetLink` using `redirectTo` which comes from the client as `${getAppBaseUrl()}/reset-password`. On native (Capacitor/HashRouter), the base URL doesn't resolve to the app. The email HTML link itself looks correct, but the `<a>` tag's `href` may not be clickable if the URL uses a non-standard scheme or if email clients strip it.
**Fix**: 
- Ensure the reset link always uses the production web URL (e.g., the published app URL or preview URL), not a Capacitor `file://` URL. 
- The `ResetPassword.tsx` page and deep link handling already support `token_hash` query params, so the web flow works. The main fix is in the edge function: ensure the `redirectTo` fallback is a proper HTTPS URL.
- In `ChangePasswordSection.tsx`, hardcode the redirect URL to a known public HTTPS URL rather than relying on `getAppBaseUrl()` which may return an iframe origin.

### 7. Restart onboarding walkthrough
**Current state**: Already implemented in `ProfileTabs` settings tab with `handleRestartWalkthrough`. It resets the flag and navigates to `/`. The walkthrough steps reference `profile`, `quick-actions`, `games`, `feed`, `navigation` — these `data-walkthrough` attributes exist on the Index page and BottomNavigation.
**Fix**: The walkthrough is already wired up. Verify the steps match current app features. The existing 5 steps cover the main sections. Add the `resetAllOnboardingHints()` call alongside the walkthrough reset so onboarding hints also reappear, giving a complete "restart" experience.

### 8. Feedback view scrolling broken
**Root cause**: The `FeedbackForm` uses a `Dialog` which has constrained max-height. On mobile, the dialog content (category grid + textarea + button) overflows without scrolling.
**Fix**: Add `overflow-y-auto max-h-[80vh]` to the `DialogContent` inner wrapper, or wrap the form content in a `ScrollArea`.

---

## Files to Change

| File | Change |
|------|--------|
| `src/pages/Settings.tsx` | Fix share URL using `getAppBaseUrl()`, fix avatar upload path to use folder structure, remove duplicate logout button |
| `src/components/events/EventInviteLink.tsx` | Add clipboard fallback for iframe/native contexts |
| `src/components/settings/ProfileStats.tsx` | Add error logging for stat queries |
| `src/components/settings/ProfileTabs.tsx` | Import and call `resetAllOnboardingHints()` in walkthrough restart handler |
| `src/components/settings/ChangePasswordSection.tsx` | Ensure redirectTo uses proper HTTPS URL |
| `src/components/feedback/FeedbackForm.tsx` | Make dialog content scrollable on mobile |
| `src/lib/clipboard.ts` (new) | Create a shared clipboard utility with textarea fallback |

