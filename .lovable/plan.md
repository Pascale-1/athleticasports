
# Fix "user_xxx" Usernames: Root Cause & Full Solution

## What Is Actually Happening (Root Cause)

### Cause 1 — Onboarding overwrites the auto-generated username

When a new user signs up, a Postgres trigger (`on_auth_user_created`) fires immediately and calls `generate_random_username()`. This creates a readable, collision-free username like `SwiftTiger3421` and inserts it into the `profiles` table.

However, when the user completes onboarding, `Onboarding.tsx` line 66 runs this:

```ts
username: `user_${user.id.substring(0, 8)}`
```

This **upsert with `ignoreDuplicates: false`** fires and replaces the nicely-generated username with `user_abc12345`. Every user who completes onboarding gets the ugly fallback.

### Cause 2 — There is no username editing field in Settings

The "About" tab in `ProfileTabs.tsx` exposes 5 editable fields: Full Name, Display Name, Sport, Team Name, Bio. The username (`@user_abc123`) is displayed in the hero section but is **completely read-only**. Users have no way to fix it themselves.

---

## What the Standard Should Be

- **The database trigger** already handles username generation correctly with a readable adjective+noun+number pattern (`SwiftTiger3421`). This is the right standard.
- **Onboarding** should not touch the username at all — it should only upsert the fields it actually collected (sport, district, display_name, avatar_url, onboarding_completed).
- **Settings** should expose a username field that users can edit, with real-time uniqueness validation.

---

## Fixes

### Fix 1 — Remove `username` from the onboarding upsert (1 line change)

In `src/pages/Onboarding.tsx`, remove the `username` field from the `upsert()` call. The profile already exists (created by the DB trigger) so only update the fields that onboarding actually collected.

**Before (line 62-76):**
```ts
const { error } = await supabase
  .from('profiles')
  .upsert({
    user_id: user.id,
    username: `user_${user.id.substring(0, 8)}`,   // ← DELETE THIS LINE
    display_name: ...,
    avatar_url: ...,
    primary_sport: selectedSport,
    preferred_district: preferredDistrict,
    onboarding_completed: true,
    is_founding_member: true,
  }, {
    onConflict: 'user_id',
    ignoreDuplicates: false,
  });
```

**After:** Use `update()` instead of `upsert()` (since the profile was already created by the trigger), and don't include `username` at all. This preserves the `SwiftTiger3421` username the trigger assigned.

### Fix 2 — Add username editing field to the About tab in Settings

In `src/components/settings/ProfileTabs.tsx`, add a username row to the About tab edit form, positioned at the top (above Full Name) since `@handle` is the primary identity.

The username field needs:
- A `@` prefix indicator (like Twitter/Instagram)
- Lowercase-only enforcement and no spaces
- Real-time uniqueness check against the database before saving
- Clear error state when username is already taken

Add a `usernameError` state and a `checkUsername` async function that queries `profiles` where `username = input AND user_id != currentUserId` to verify availability.

The display (non-edit) state continues to show `@username` as read-only text (same as now, but visually consistent with the other fields).

### Fix 3 — Fix existing users with `user_xxx` usernames (database migration)

For users already in the database with `user_xxx` usernames, run a one-time migration to replace them with the properly-generated readable names:

```sql
UPDATE profiles
SET username = generate_random_username()
WHERE username ~ '^user_[a-f0-9]{8}$';
```

This only affects accounts that were created via the broken onboarding path (matching the `user_` + 8-char hex pattern).

---

## Files Changed

| File | Change |
|------|--------|
| `src/pages/Onboarding.tsx` | Switch from `upsert` to `update`, remove `username` field entirely |
| `src/components/settings/ProfileTabs.tsx` | Add username field to About tab edit form with `@` prefix, lowercase validation, uniqueness check |
| Database migration | One-time SQL to fix existing `user_xxx` accounts |

No new packages. No Supabase Edge Functions needed. No schema changes (username column already exists and is unique-constrained).

---

## UX After Fix

**During onboarding:** User sees no username prompt — they get `SwiftTiger3421` assigned automatically.

**In Settings → About tab (edit mode):**
```
@ [swifttiger3421        ]   ← editable, @ prefix, lowercase
  ✓ Username available        ← green check when unique
  ✗ Username already taken    ← red error when conflict
```

**Hero card:**
```
@swifttiger3421   ← stays as-is, but now readable
```

Users who want a custom handle can go to Settings → About → Edit and set e.g. `@thomas_fc`.
