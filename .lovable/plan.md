

## Fix: Email-based invitation doesn't resolve existing user

### Root Cause

When you invite by email (e.g. `pascale9a@gmail.com`), the `sendInvitation` function tries to find the user via `profiles_public.username`, which doesn't match emails. Since emails live in `auth.users` (inaccessible client-side), `invited_user_id` stays `null`.

**Consequences:**
- The `notify_team_invitation` trigger checks `IF NEW.invited_user_id IS NOT NULL` — so **no in-app notification** is sent
- The code falls through to send an email instead, which is the wrong path for existing users
- The invited user sees the invitation only if they happen to check the pending invitations page (via `email = get_current_user_email()` RLS match), but they're never notified

### Fix

1. **Database migration** — Create a `SECURITY DEFINER` function `resolve_user_id_by_email(text)` that looks up a user_id from `auth.users` by email. Returns `null` if no match. This is safe because it only returns the UUID, not any private data.

```sql
CREATE OR REPLACE FUNCTION public.resolve_user_id_by_email(_email text)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM auth.users WHERE email = lower(_email) LIMIT 1;
$$;
```

2. **`src/hooks/useTeamInvitations.ts`** — In the `sendInvitation` function, when the input is an email (`isUserId=false` and contains `@`), call `supabase.rpc('resolve_user_id_by_email', { _email: emailOrUserId })` to resolve the user. If found, set `invitedUserId` so the notification trigger fires and the user gets an in-app notification instead of (or in addition to) an email.

3. **`src/hooks/useTeamInvitations.ts`** — Also send the email as a backup even for existing users (they might not check the app immediately), but the primary notification path becomes the in-app notification.

### Changes Summary
- 1 database migration (new function)
- 1 file edit (`useTeamInvitations.ts` — update email invitation path to resolve user)

