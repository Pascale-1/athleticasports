

## Match Result Visibility — Analysis

### What's happening
The event you're viewing (`Leb Test vs Tina Corner`, March 10 at 18:00) is a **future match** — it hasn't happened yet. The match result card only appears when:
1. The event is **past** (end time has passed), OR
2. A result has **already been saved**

This is the correct behavior — you can't enter a score before the game is played.

### What to change?
Two options:

**Option A: Keep current behavior (recommended)**
No changes. The score entry form will automatically appear once March 10 at 19:30 passes. This prevents accidental premature score entry.

**Option B: Show score entry for all match events regardless of time**
Change line 596 in `EventDetail.tsx` from:
```tsx
{event.type === 'match' && (isPastEvent || event.match_result) && (
```
to:
```tsx
{event.type === 'match' && (
```
This would let organizers enter scores early (e.g., if they want to pre-fill or the game ended before the scheduled end time).

### Recommendation
**Option B** is more practical — games often end before the scheduled `end_time`, and organizers may want to record the score right after the match. The `canEdit` guard already ensures only the creator/admin can enter scores.

### Changes
| File | Change |
|------|--------|
| `src/pages/EventDetail.tsx` line 596 | Remove `isPastEvent` guard, show match result card for all match events |

