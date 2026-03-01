

# Make Username Always User-Chosen

## Problem

1. The DB function `generate_random_username()` creates usernames like `SwiftStriker1234`, but `isSystemUsername()` only matches `user_[0-9a-f]+`. So existing users are never redirected to `/choose-username`.
2. New users also get a random username that looks "real", so they're never prompted to choose one.
3. The username is not visible as a field in the profile settings.

## Plan

### 1. Database migration: Replace `generate_random_username()` to produce `user_` prefix format

Change the function to generate usernames like `user_a3f8b201` (8 hex chars), which matches the existing `isSystemUsername()` regex. This ensures all new signups are detected as system usernames and redirected to `/choose-username`.

### 2. Database data update: Mark all existing auto-generated usernames

Run an UPDATE to convert all existing non-custom usernames (those matching the old adjective+noun+number pattern) to `user_` format. This will force existing users to choose a username on next login.

Since we cannot easily regex-match all old generated names, the safest approach: update all profiles where `username` does not match a "clean custom" pattern AND was never manually set. We can identify them by checking if the username matches common patterns from the old generator (e.g., contains adjective+noun combos). A simpler approach: reset ALL usernames that haven't been explicitly chosen. Since the app is early-stage, we can set all profiles where `username` matches the old pattern to `user_` + first 8 chars of `user_id`.

### 3. Frontend: Show username in profile settings (read-only)

Add a `@username` row in the Overview tab of `ProfileTabs.tsx`, next to the email row.

### 4. Clear sessionStorage cache

The `ProtectedRoute` caches `username_ok_` in sessionStorage. After resetting usernames, existing sessions will still have the cache. Add a cache-busting version check so the redirect triggers for reset users.

### Files modified
1. **New migration** -- replace `generate_random_username()` to produce `user_` + hex format
2. **Data update** -- reset existing auto-generated usernames to `user_` + substr(user_id)
3. `src/components/settings/ProfileTabs.tsx` -- add read-only username display row
4. `src/components/ProtectedRoute.tsx` -- minor: clear stale sessionStorage on username mismatch

