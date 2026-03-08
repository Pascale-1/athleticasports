

## Fix: Team badge "1" persists after treating invitation

### Root Cause
The badge count in `BottomNavigation` uses a React Query with `staleTime: 30_000` (30s cache). When an invitation is accepted/declined in `InlineInvitationCards`, the component removes the card from local state but never invalidates the `['navigation-badges', userId]` query. The realtime subscription exists but the invitation status update happens via a service-role edge function, which may not reliably trigger client-visible realtime events.

### Fix
Explicitly invalidate the `navigation-badges` query from `InlineInvitationCards` after accept or decline.

**`src/components/events/InlineTeamPills.tsx`** — no changes needed (different component).

**`src/components/teams/InlineInvitationCards.tsx`**:
- Import `useQueryClient` from `@tanstack/react-query`
- After `onRemove(invitation.id)` in both `handleAccept` and `handleDecline`, call `queryClient.invalidateQueries({ queryKey: ['navigation-badges'] })` to force an immediate badge refresh.

This is a one-file, ~5-line change.

