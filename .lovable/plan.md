

# Fix: Pending Invitations Banner 404

## Problem
In `src/pages/Teams.tsx` line 204, clicking the "You have X pending invitations" banner navigates to `/invitations`, which doesn't exist as a route in `App.tsx`. This causes a 404.

## Solution
Two things need to happen:

### 1. Create a new `PendingInvitations` page
Create `src/pages/PendingInvitations.tsx` that:
- Fetches all pending invitations for the current user (matching by `user_id`, `email`, or `username`)
- Displays each invitation as a card showing team name, invited by, and date
- Provides Accept and Decline buttons per invitation
- Accept calls the existing `accept-team-invitation` edge function
- Decline updates the invitation status to `rejected`

### 2. Add the route in `App.tsx`
Add a protected route at `/invitations` pointing to the new `PendingInvitations` page, wrapped in `AppLayout`.

## Files Changed

| File | Change |
|------|--------|
| `src/pages/PendingInvitations.tsx` | New page: list pending invitations with accept/decline actions |
| `src/App.tsx` | Add `/invitations` route (lazy-loaded, protected, with AppLayout) |

No database changes needed — the `team_invitations` table and `accept-team-invitation` edge function already exist.

