

# Fix: Stale Pending Invitations Banner

## Problem
Two issues cause the banner to show "1 pending invitation" while the page shows 0:

1. **`usePendingInvitations` hook** (line 36) does NOT filter by `expires_at`, so it counts expired invitations
2. **`PendingInvitations` page** (line 57) DOES filter `.gt("expires_at", ...)`, so it returns 0 results

Additionally, navigating to a separate page just to see an empty list is a poor UX.

## Solution
Better approach: **show invitations inline on the Teams page** instead of navigating to a separate page. Replace the banner with expandable invitation cards directly in the Teams page. This eliminates the mismatch entirely.

### Changes

| File | Change |
|------|--------|
| `src/hooks/usePendingInvitations.ts` | Add `.gt("expires_at", new Date().toISOString())` filter to match the page query. Also return the actual invitation data (not just count) so Teams page can render them inline. |
| `src/pages/Teams.tsx` | Replace the banner that navigates to `/invitations` with inline invitation cards showing team name + accept/decline buttons directly. Use the enriched data from the updated hook. |

### Hook changes (`usePendingInvitations.ts`)
- Add `expires_at` filter to the count query
- Add a second state `invitations` that fetches full invitation data (team name, inviter, etc.)
- Return `{ count, invitations, loading, refetch }`

### Teams page changes (`Teams.tsx`)
- Remove the `navigate('/invitations')` banner
- When `invitations.length > 0`, render each invitation as an inline card with:
  - Team avatar + name + sport badge
  - "Invited by X" subtitle
  - Accept / Decline buttons
- On Accept: call `accept-team-invitation` edge function, handle expired error gracefully, remove from list
- On Decline: update status to `declined`, remove from list
- Keep the `/invitations` route working as a fallback but the primary UX is inline

### Expired error handling
- If accept returns "expired", show a toast and remove from local state
- The hook's `expires_at` filter prevents most cases, but edge function validation catches race conditions

No database changes. No new packages.

