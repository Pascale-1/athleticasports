

# Fix: Proper Display Names Instead of "Player"

## Root Cause

The signup form (`Auth.tsx`) only collects email + password — no name field. So for email signups:
- `raw_user_meta_data->>'full_name'` is null
- The DB trigger `handle_new_user()` sets `display_name` to null
- The onboarding page (`Onboarding.tsx`) also reads from `user.user_metadata?.full_name` which is null
- Result: everyone shows as "Player" (our recent sanitization) or `user_abc123`

OAuth users (Google, etc.) get a name from the provider, but email users never provide one.

## Modern Practice

Apps like Strava, Heja, TeamSnap, and Discord all ask for a **first name** (or full name) during signup. This is the standard approach — collect the name at registration time, not as an optional profile edit later.

## Plan

### 1. Add "Full Name" field to signup form (`src/pages/Auth.tsx`)
- Add a `fullName` text input that appears only during sign-up (not login)
- Pass it as `data.full_name` in the `options.data` metadata of `supabase.auth.signUp()`
- This makes it available to the DB trigger `handle_new_user()` which already reads `raw_user_meta_data->>'full_name'`

### 2. Update onboarding fallback (`src/pages/Onboarding.tsx`)
- The onboarding upsert already reads `user.user_metadata?.full_name` — no change needed there, it will now have a value

### 3. Update display name fallback across the app
- In `EventAttendees.tsx`: instead of showing "Player" for `user_` prefixed names, keep "Player" only as the absolute last resort — but now most users will have a real `display_name`
- The `handle_new_user()` trigger already sets `display_name = coalesce(new.raw_user_meta_data->>'full_name', ...)` so new signups will automatically get proper names

### Files to Change

| File | Change |
|------|--------|
| `src/pages/Auth.tsx` | Add `fullName` field to signup schema + form UI, pass in `signUp()` metadata |
| `src/i18n/locales/en/auth.json` | Add `"fullName"` and `"fullNameRequired"` translation keys |
| `src/i18n/locales/fr/auth.json` | Add French equivalents |

Three files. Existing users without names will still show "Player" until they update their profile, which is acceptable.

