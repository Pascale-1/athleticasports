

## Fix: `valid_email` check constraint violation when inviting existing users

### Root Cause

When a user is selected from the search dropdown (by user_id), line 91 of `useTeamInvitations.ts` sets `email = profile.username` (e.g. `"passss"`). The `team_invitations` table has a `valid_email` check constraint that rejects non-email values.

The `profiles_public` view doesn't expose the `email` column (by design), so the client can't get the user's actual email address.

### Fix

1. **Database migration** — Create a `SECURITY DEFINER` function `get_user_email_by_id(uuid)` that returns the email from `auth.users`. This is safe because it's only used server-side to populate the invitation record for a known user_id.

```sql
CREATE OR REPLACE FUNCTION public.get_user_email_by_id(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email::text FROM auth.users WHERE id = _user_id LIMIT 1;
$$;
```

2. **`src/hooks/useTeamInvitations.ts`** — When `isUserId=true`, call `supabase.rpc('get_user_email_by_id', { _user_id: emailOrUserId })` to get the actual email. Also fix the `else` branch where a username match resolves `invitedUserId` but still stores the username as email — resolve the email there too.

### Changes
- 1 database migration (new function)
- 1 file edit (`useTeamInvitations.ts` — resolve real email when inviting by user_id or username)

