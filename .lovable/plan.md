

## Fix: Invite Dialog Layout + User Search Not Working

### Issue 1: Dialog off-center on mobile
The `InviteMemberDialog` has `className="mx-3 sm:mx-auto ..."` on `DialogContent`. Since `DialogContent` is `position: fixed` with `left-[50%] translate-x-[-50%]`, adding `mx-3` creates asymmetric horizontal margin that shifts it right. Remove `mx-3 sm:mx-auto` — the dialog's fixed centering handles positioning already.

### Issue 2: User search returns no results
**Root cause**: The `profiles_public` view was created with `security_invoker = true`, which means the underlying `profiles` table RLS applies. Since the current RLS policy only allows `auth.uid() = user_id`, users can only see their own profile through the view — so searching for other usernames returns nothing.

**Fix**: Recreate the view **without** `security_invoker` (default is `security_definer` for views, which bypasses RLS on the underlying table). The view already excludes the `email` column, so it's safe for authenticated users to query. The `GRANT SELECT` to `authenticated` controls who can access the view itself.

### Changes

1. **Database migration** — Recreate `profiles_public` view without `security_invoker = true`
```sql
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT id, user_id, username, display_name, avatar_url, bio, full_name,
       primary_sport, team_name, preferred_district, is_founding_member,
       onboarding_completed, created_at, updated_at
FROM public.profiles;
```

2. **`src/components/teams/InviteMemberDialog.tsx`** — Remove `mx-3 sm:mx-auto` from `DialogContent` className

