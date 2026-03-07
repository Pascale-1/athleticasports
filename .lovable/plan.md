

## Bug Audit Results

After reviewing console logs (no errors), network requests (no failures), session replay, and key source files, here is what I found:

### Bugs Found

**1. Unused `Input` imports (minor, no runtime impact)**
- `src/components/events/EventInviteLink.tsx` line 6: imports `Input` from `@/components/ui/input` but never uses it (the input field was removed in the earlier refactor).
- `src/components/teams/TeamInviteLink.tsx` line 6: same — `Input` is imported but no longer used.

These won't cause runtime errors but are dead code that should be cleaned up.

**2. No other bugs detected**
- The share section on EventDetail is now correctly ungated (visible to all users, not just organizers).
- The performance levels are properly gated behind `canViewPerformance` on both the TeamDetail page and the TeamPerformance route.
- Translation keys (`copy`, `copied`, `share`) all exist in both EN and FR locale files.
- The `EventInviteLink` component properly accepts and uses the `isOrganizer` prop.
- Route protection and auth flows appear correct.
- No console errors or failed network requests.

### Proposed Fix

| File | Change |
|------|--------|
| `src/components/events/EventInviteLink.tsx` (line 6) | Remove unused `Input` import |
| `src/components/teams/TeamInviteLink.tsx` (line 6) | Remove unused `Input` import |

This is a minor cleanup — two lines total. No functional or behavioral changes.

