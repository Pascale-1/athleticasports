

## Simplify Profile: Remove `full_name`, Keep Only `display_name` + `username`

### Current State
The `profiles` table has both `full_name` and `display_name` columns. In practice they serve overlapping purposes, creating confusion in the UI (the "About" tab shows both fields). `full_name` is also used as a fallback in `usernameUtils.ts` and during onboarding/signup.

### Plan

**1. Database migration** — Drop the `full_name` column from `profiles` and recreate the `profiles_public` view without it.

```sql
ALTER TABLE public.profiles DROP COLUMN IF EXISTS full_name;

CREATE OR REPLACE VIEW public.profiles_public AS
SELECT id, user_id, username, display_name, avatar_url, bio,
       primary_sport, team_name, preferred_district, is_founding_member,
       onboarding_completed, created_at, updated_at
FROM public.profiles;
```

**2. Update `src/lib/usernameUtils.ts`** — Remove `fullName` parameter from `getFriendlyUsername` and `getDisplayUsername`. Use only `displayName` as the fallback when username is a system UID.

**3. Update `src/components/settings/ProfileTabs.tsx`** — Remove the "Full Name" field from the About tab. Keep only Display Name.

**4. Update `src/pages/Settings.tsx`** — Remove `full_name` from the Profile interface and save logic. Remove `fullName` from `tempValues` and `updateData`.

**5. Update `src/pages/Auth.tsx`** — Map the signup `full_name` metadata to `display_name` instead (or just remove it since `handle_new_user` trigger uses it).

**6. Update `src/pages/Onboarding.tsx`** — Set `display_name` from user metadata (currently sets `display_name` already, just remove any `full_name` references).

**7. Update `src/pages/ChooseUsername.tsx`** — Remove `full_name` from the profile query; use only `display_name`.

**8. Update all callers of `getDisplayUsername`/`getFriendlyUsername`** — Remove the third `fullName` argument (Settings.tsx, ProfileTabs.tsx, etc.).

**9. Update `handle_new_user()` trigger** — Store the OAuth name in `display_name` instead of relying on a separate column. Migration:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user() ...
  insert into public.profiles (user_id, username, display_name)
  values (new.id, generate_random_username(),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'));
```
(This is already what it does, so no change needed here.)

### Files Changed
- 1 database migration (drop column + recreate view + update trigger if needed)
- `src/lib/usernameUtils.ts`
- `src/components/settings/ProfileTabs.tsx`
- `src/pages/Settings.tsx`
- `src/pages/Auth.tsx`
- `src/pages/ChooseUsername.tsx`
- `src/pages/Onboarding.tsx`
- `src/pages/Users.tsx` (if it references full_name)

