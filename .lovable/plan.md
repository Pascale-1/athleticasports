
# Comprehensive Bug Fix Plan -- Google Play Testing Feedback

## Overview

This plan addresses all 12 issues identified during Google Play testing, plus the feedback email notification feature. Changes are grouped by priority.

---

## P0 -- Critical Auth Fixes (Auth.tsx)

### 1. Remove Phone Sign-In entirely
The phone tab, schema, form, and handler will be removed. Since only email remains besides Google, the Tabs component will be removed entirely -- just show the email form directly below the Google button.

### 2. Remove duplicate Google Sign-In button
The second Google button (inside the email tab, lines 436-482) and its "Or continue with" divider will be deleted.

### 3. Google Sign-In redirect fix
The current `supabase.auth.signInWithOAuth()` redirects through the Supabase hosted auth page, which lands on Lovable's domain. The fix is to add `skipBrowserRedirect: false` and ensure the `redirectTo` points to the correct deployed app URL. Additionally, the PWA service worker config in `vite.config.ts` needs to add `/~oauth` to the `navigateFallbackDenylist` so the service worker doesn't intercept the OAuth callback.

**Files:** `src/pages/Auth.tsx`, `vite.config.ts`

---

## P1 -- Onboarding Double-Submit Fix

### 4. Prevent onboarding from repeating

Two changes:
- **Onboarding.tsx**: Add a `saving` guard so the complete button can't be pressed twice. Add a small delay (500ms) after successful upsert before navigating, giving the database time to propagate.
- **ProtectedRoute.tsx**: Once `onboardingCompleted` has been set to `true`, never re-fetch. Use a ref to cache the result so that when `user` state triggers re-renders (auth listener fires), the onboarding check doesn't run again.

**Files:** `src/pages/Onboarding.tsx`, `src/components/ProtectedRoute.tsx`

---

## P2 -- Data & Functionality Fixes

### 5. Team invitation "valid_email" constraint error

When inviting by user search, line 90 sets `email = profile.username` (e.g., "SwiftStriker4231"), which violates the `valid_email` CHECK constraint on `team_invitations.email`.

**Fix:** Change the profile query on line 83-87 to also select `email`:
```
.select("username, email")
```
Then use `profile.email || profile.username` as the email value. Since the `sync_profile_email` trigger populates `profiles.email` from `auth.users`, this should always have a valid email for real users.

**File:** `src/hooks/useTeamInvitations.ts`

### 6. Events not showing on Home "upcoming events"

The Home page uses `useUserEvents({ type: 'match', status: 'upcoming' })` which only fetches match-type events. Tennis and basketball training/meetup events won't appear.

**Fix:** Remove the `type: 'match'` filter so all upcoming user events appear. Rename the section heading from "yourUpcomingGames" to "yourUpcomingEvents" (add new i18n key).

**File:** `src/pages/Index.tsx`

### 7-9. Cross-user visibility (Events, Activity Feed, Teams)

These are working as designed by the RLS policies:
- Events: Public events ARE visible. Team events require membership. Personal events (team_id IS NULL) are visible to all authenticated users.
- Activity feed: Only shows logs from yourself, followers, or teammates. This is privacy-respecting behavior.
- Teams: Public teams ARE visible (`NOT is_private`). Private teams require membership.

No code changes needed -- these work correctly. The issue is likely that test events were created as non-public or test teams as private.

---

## P3 -- i18n Fixes

### 10. QuickTeamCreateDialog shows raw keys ("teams.form.name")

Line 60: `useTranslation()` without a namespace. All `t()` calls use `teams.form.name` format which looks for keys in the default `common` namespace.

**Fix:** Change to `useTranslation('teams')` and update all `t()` calls to remove the `teams.` prefix (e.g., `t('teams.form.name')` becomes `t('form.name')`, `t('teams.createTeam')` becomes `t('createTeam')`).

**File:** `src/components/teams/QuickTeamCreateDialog.tsx`

### 11. Remaining hardcoded English strings

Multiple components still have hardcoded English. The Auth page in particular has all English strings. A systematic pass will add i18n keys for the most visible ones.

---

## P4 -- Feedback Email Notification

### 12. Send email to athletica.sports.app@gmail.com on feedback submission

**New edge function:** `supabase/functions/notify-feedback/index.ts`
- Receives feedback data (category, message, user email, page URL)
- Sends a formatted email via Resend to `athletica.sports.app@gmail.com`
- Uses the existing `RESEND_API_KEY` secret

**FeedbackForm update:** After successful insert into the `feedback` table, call the `notify-feedback` edge function with the feedback data.

**Home page feedback button:** Replace the ghost icon-only button with a small outlined button showing "Feedback" text next to the Megaphone icon for better visibility.

**Files:** `supabase/functions/notify-feedback/index.ts` (new), `src/components/feedback/FeedbackForm.tsx`, `src/pages/Index.tsx`, `supabase/config.toml` (add function config)

---

## Technical Details

| File | Changes |
|------|---------|
| `src/pages/Auth.tsx` | Remove phone auth (schema, form, handler, tab). Remove duplicate Google button. Remove Tabs wrapper, show email form directly. Add `navigateFallbackDenylist` note. |
| `vite.config.ts` | Add `navigateFallbackDenylist: [/^\/~oauth/]` to PWA workbox config |
| `src/pages/Onboarding.tsx` | Add saving guard, 500ms delay before navigate |
| `src/components/ProtectedRoute.tsx` | Cache onboarding result with ref to prevent re-fetch loops |
| `src/hooks/useTeamInvitations.ts` | Fix line 85-90: select `email` from profiles, use real email instead of username |
| `src/pages/Index.tsx` | Remove `type: 'match'` filter from useUserEvents. Make feedback button visible with label. |
| `src/components/teams/QuickTeamCreateDialog.tsx` | Fix `useTranslation()` to `useTranslation('teams')`, update all t() calls |
| `supabase/functions/notify-feedback/index.ts` | **New file.** Edge function to send feedback email via Resend to athletica.sports.app@gmail.com |
| `src/components/feedback/FeedbackForm.tsx` | Call notify-feedback edge function after successful insert. Improve success toast message. |
| `supabase/config.toml` | Add `[functions.notify-feedback]` with `verify_jwt = false` |

### No database schema changes required.
