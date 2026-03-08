

## Restore Missing Buttons & Complete Toast Migration Cleanup

### Investigation Result
Both the "I paid" button and "Generate teams" section exist in the code at `src/pages/EventDetail.tsx`. They are conditionally rendered — the buttons only appear when specific conditions are met. There is no code deletion causing them to disappear.

However, **`EventDetail.tsx` still imports `useToast`** (the old sticky toast system) which was supposed to be fully migrated to Sonner. This leftover, along with 3 other files missed in the migration, needs cleanup.

### Root Cause
The conditions gating these buttons are correct but may be too strict:
- "I paid" only shows when `userStatus === 'attending'` and `hasPaid === false` — if the attendance hook has a timing issue loading `userStatus`, the button won't render
- "Generate teams" only shows when `isTeamMember === true` — this depends on an RPC call (`is_team_member`) that may not resolve before render

### Plan

**1. Clean up remaining `useToast` in `EventDetail.tsx`**
- Remove `import { useToast }` and the `const { toast } = useToast()` line (it's unused dead code)

**2. Migrate remaining files missed in the Sonner refactor**
- `src/hooks/useLogout.ts` — switch to `toast` from sonner
- `src/components/settings/AccountDangerZone.tsx` — switch to `toast` from sonner
- `src/components/matching/CreateMatchSheet.tsx` — switch to `toast` from sonner
- `src/components/teams/QuickTeamCreateDialog.tsx` — switch to `toast` from sonner

**3. Ensure buttons render reliably**
- No logic changes needed — both buttons are correctly implemented. If the user is not seeing them, it's because the conditions aren't met for the specific event they're viewing (e.g., event isn't paid, or user isn't attending, or event isn't a training type linked to a team).

### Files Changed
| File | Change |
|---|---|
| `src/pages/EventDetail.tsx` | Remove unused `useToast` import and hook call |
| `src/hooks/useLogout.ts` | Migrate from `useToast` to Sonner |
| `src/components/settings/AccountDangerZone.tsx` | Migrate from `useToast` to Sonner |
| `src/components/matching/CreateMatchSheet.tsx` | Migrate from `useToast` to Sonner |
| `src/components/teams/QuickTeamCreateDialog.tsx` | Migrate from `useToast` to Sonner |

