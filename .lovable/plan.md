

## Fix Resend Invitation + Browser Verification

### Problem
The `team_invitations` table UPDATE policy only permits the **invited user** to update records (for accept/decline). When a team admin resends an invitation, the email is sent but the `created_at` timestamp update silently fails, so the "invited X ago" text never refreshes.

### Fix

**Database migration** -- Add an UPDATE policy for team admins:

```sql
CREATE POLICY "Team admins can update invitations"
ON public.team_invitations
FOR UPDATE
USING (can_manage_team(auth.uid(), team_id) OR (auth.uid() = invited_by))
WITH CHECK (can_manage_team(auth.uid(), team_id) OR (auth.uid() = invited_by));
```

This allows the inviter or any team admin to update invitation records (e.g. refreshing `created_at` on resend).

### Browser Testing
After the migration, test the full invite member flow end-to-end:
1. Navigate to a team detail page
2. Open the invite member dialog
3. Search for a user and send an invitation
4. Verify the pending invitation appears in the list
5. Test the resend button and confirm the timestamp updates
6. Test the cancel button

### Files Changed
- Database migration only (one new RLS policy)
- No code file changes needed

