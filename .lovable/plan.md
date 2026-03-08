

## Fix Critical Security Issues

### Problem
1. **`profiles.email` exposed to all authenticated users** — the SELECT policy is `USING (true)`, so any logged-in user can read every user's email address
2. **`team_messages_with_profiles`** and **`user_feedback_view`** — both views already use `security_invoker=true` (so underlying table RLS applies), but worth confirming they're working correctly

### Analysis

The views are actually already secured via `security_invoker=true` — the scan flags them because views can't have explicit RLS policies, but the underlying tables (`team_messages`, `feedback`) do have proper RLS. No changes needed for the views themselves.

The real issue is **`profiles.email`**: currently readable by all authenticated users. Email is only used in 3 places:
- **Settings page** — user views their *own* email (from `auth.getUser()`, not profiles)
- **Invitation matching** — `usePendingInvitations.ts`, `BottomNavigation.tsx`, `useTeamInvitations.ts` — need current user's own email to match invitations
- **Admin page** — `select('*')` on profiles

### Solution

Create a **`profiles_public`** view that excludes the `email` column, and update the profiles SELECT policy to only allow users to read their own email directly. All non-self profile queries switch to the view.

### Changes

1. **Database migration**:
   - Create `profiles_public` view (all columns except `email`) with `security_invoker=true`
   - Drop the existing permissive SELECT policy on `profiles`
   - Add two new SELECT policies:
     - "Users can view own full profile" — `USING (auth.uid() = user_id)` (includes email)
     - "Authenticated can view public profiles" — `USING (true)` on `profiles_public` view (no email)
   - Grant SELECT on `profiles_public` to `authenticated`

2. **`src/pages/Users.tsx`** — Change `.from('profiles')` to `.from('profiles_public')` (doesn't need email)

3. **`src/pages/Admin.tsx`** — Keep `.from('profiles')` (admin reads own data or can use the has_role check — actually admins query all profiles). Change to `.from('profiles_public')` since admin doesn't display emails either.

4. **`src/hooks/useActivityFeed.ts`** — Already only selects `user_id, username, display_name, avatar_url` — change to `.from('profiles_public')`

5. **`src/hooks/useTeamInvitations.ts`** — Needs current user's email. Instead of reading from profiles, use `supabase.auth.getUser()` to get email (already authenticated).

6. **`src/hooks/usePendingInvitations.ts`** and **`src/pages/PendingInvitations.tsx`** — Same fix: get email from `auth.getUser()` instead of profiles table.

7. **`src/components/mobile/BottomNavigation.tsx`** — Same: get email from auth session, not profiles.

8. **`src/pages/Settings.tsx`** — Already gets email from `auth.getUser()`. The `select('*')` can stay since users can read their own full profile.

9. **`src/pages/Index.tsx`** and **`src/components/ProtectedRoute.tsx`** — Only read own profile, so existing policy covers them. No change needed.

### Summary of file changes
- **1 database migration** — create `profiles_public` view, update RLS policies
- **`src/pages/Users.tsx`** — query `profiles_public` instead of `profiles`
- **`src/pages/Admin.tsx`** — query `profiles_public`
- **`src/hooks/useActivityFeed.ts`** — query `profiles_public`
- **`src/hooks/useTeamInvitations.ts`** — get email from `auth.getUser()`
- **`src/hooks/usePendingInvitations.ts`** — get email from `auth.getUser()`
- **`src/pages/PendingInvitations.tsx`** — get email from `auth.getUser()`
- **`src/components/mobile/BottomNavigation.tsx`** — get email from auth, query `profiles_public`

