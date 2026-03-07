

## Plan: Smart Team Invitation Flow (Existing vs New Users)

### Problem

When inviting someone by email who doesn't have an account:
1. The email links to `/teams/invitations/accept?id=...`
2. `AcceptInvitation` checks for a session, finds none, redirects to `/auth`
3. User sees a sign-in page with no context about the invitation — confusing
4. After signing up, the `accept-team-invitation` edge function may fail because `invited_user_id` is NULL and the email match check depends on `auth.users.email`, but the RLS UPDATE policy on `team_invitations` requires `auth.uid() = invited_user_id` — which is NULL for email-only invitations, so the user can't even decline/respond client-side

### Solution: Differentiate existing vs new users at invitation time

**In `useTeamInvitations.sendInvitation`:**

When inviting by email (not by user search):
- Check if a profile exists with that email in the `profiles` table
- **If user exists**: set `invited_user_id` on the invitation → triggers the `notify_team_invitation` DB trigger → user gets an in-app notification and can accept from the Teams tab. Skip sending an email.
- **If user does NOT exist**: keep `invited_user_id` as NULL, send the email invitation as today, but improve the email to clearly direct them to sign up.

### Changes

| File | Change |
|------|--------|
| `src/hooks/useTeamInvitations.ts` | In `sendInvitation`, when `!isUserId` and input is an email: query `profiles` by email column. If found, set `invited_user_id` and skip the email function call. If not found, proceed with email as today. |
| `supabase/functions/send-team-invitation/index.ts` | Update email template: remove references to Google Sign-in (removed from app). Clarify the sign-up flow — mention they'll choose a username after signing up. |
| `supabase/functions/accept-team-invitation/index.ts` | Add a fallback: if `invited_user_id` is NULL and the user's email matches `invitation.email`, also link `invited_user_id` to the user so future queries work. Already partially handled but worth hardening. |
| `src/pages/AcceptInvitation.tsx` | Wait for auth to be fully ready before checking session (use `getUser()` not `getSession()`). If not authenticated, show a friendlier landing page with team name context before redirecting to auth — instead of an instant redirect. |

### Detail on AcceptInvitation UX improvement

Instead of immediately redirecting to `/auth`, the page will:
1. Fetch basic invitation info (team name) via the `get_team_info_for_invitation` RPC (already exists, works for invited users)
2. Show a card: "You've been invited to join **TeamName**" with two buttons: "Sign In" / "Create Account"
3. Both buttons navigate to `/auth?invitationId=...` (sign-up mode pre-selected for "Create Account")

This gives the user context about why they're being asked to sign in.

### RLS fix for email-only invitations

The UPDATE policy on `team_invitations` requires `auth.uid() = invited_user_id`. For email-only invitations where `invited_user_id` is NULL, the `InlineInvitationCards` decline action fails silently. The edge function `accept-team-invitation` uses service role so it bypasses RLS — that path is fine. But we should update the RLS UPDATE policy to also allow updates when the user's email matches the invitation email:

```sql
DROP POLICY "Users can respond to their invitations" ON public.team_invitations;
CREATE POLICY "Users can respond to their invitations"
ON public.team_invitations FOR UPDATE TO authenticated
USING (
  auth.uid() = invited_user_id
  OR (
    invited_user_id IS NULL
    AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
)
WITH CHECK (
  auth.uid() = invited_user_id
  OR (
    invited_user_id IS NULL
    AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);
```

Also update the SELECT policy so email-matched users can see their invitations:

```sql
DROP POLICY "Team invitations viewable by team members" ON public.team_invitations;
CREATE POLICY "Team invitations viewable by relevant users"
ON public.team_invitations FOR SELECT TO authenticated
USING (
  is_team_member(auth.uid(), team_id)
  OR auth.uid() = invited_user_id
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
);
```

### Summary

1. **DB migration**: Fix RLS policies on `team_invitations` for email-based matching
2. **`useTeamInvitations.ts`**: Check if email user exists → set `invited_user_id` and skip email; otherwise send email
3. **`AcceptInvitation.tsx`**: Show contextual landing page instead of instant redirect
4. **`send-team-invitation/index.ts`**: Remove Google sign-in references, improve copy
5. **`accept-team-invitation/index.ts`**: Backfill `invited_user_id` on successful email-match acceptance

