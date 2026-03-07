

## Fix: "permission denied for table users" on Team Invitation

### Root Cause
The `team_invitations` table has two RLS policies (SELECT and UPDATE) that directly query `auth.users` to compare the invited email with the current user's email:

```sql
email = (SELECT users.email FROM auth.users WHERE users.id = auth.uid())
```

The `authenticated` role does not have SELECT permission on `auth.users`. This fails when the INSERT in `sendInvitation` uses `.select()` to return the newly created row, triggering the SELECT policy evaluation.

### Fix — Database Migration (2 steps)

**Step 1: Create a SECURITY DEFINER function** to safely retrieve the current user's email:

```sql
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email::text FROM auth.users WHERE id = auth.uid();
$$;
```

**Step 2: Replace the `auth.users` references** in the two RLS policies on `team_invitations`:

- **SELECT policy** ("Team invitations viewable by relevant users"): Replace the subquery with `public.get_current_user_email()`
- **UPDATE policy** ("Users can respond to their invitations"): Replace both USING and WITH CHECK subqueries with `public.get_current_user_email()`

Updated policy expressions:
```sql
-- SELECT: replace (email = (SELECT ... FROM auth.users ...)) with:
email = public.get_current_user_email()

-- UPDATE USING & WITH CHECK: replace similarly
```

### Files Changed
- Database migration only (no application code changes needed)

