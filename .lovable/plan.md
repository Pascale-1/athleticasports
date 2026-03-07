

## Fixes: Event Card Stats + Light Mode Contrast

### Problem 1: Match result not showing on EventCard
The EventCard already has the result display code (lines 266-281) using `event.match_result` and `event.match_outcome`. The data flows through correctly from `select("*")` queries. If no result appears, it's because no match results have been entered yet for any events — the feature works but there's no data. **However**, the user may be confused about *where* to enter results. The score entry form is buried inside the Match Details card on EventDetail, only visible for past matches when you're the organizer.

**Fix:** Make the MatchResultEntry more prominent on EventDetail — move it to a standalone card outside the Match Details section so it's clearly visible and not collapsed inside another card.

### Problem 2: Light mode text contrast issues
The root cause: in `.light` mode, `--accent-foreground` is set to `0 0% 100%` (pure white). Components using `text-accent-foreground` render invisible white text on white backgrounds. This affects:
- EventCard: "looking for players" indicator (`text-accent-foreground`)
- EventCard: meetup type chip colors
- LookingForPlayersBanner: title text uses inherited foreground (fine), but the `font-medium text-sm` without explicit dark color can appear thin

**Fix in `src/index.css`:** Change light mode `--accent-foreground` from white (`0 0% 100%`) to a dark readable color like `220 31% 9%` (same as `--foreground`). This makes `text-accent-foreground` readable on light backgrounds.

Additionally, in `LookingForPlayersBanner.tsx`, add explicit `text-foreground` to the title span to ensure it's always readable regardless of theme.

### Files to modify

| File | Change |
|------|--------|
| `src/index.css` | Fix `--accent-foreground` in `.light` to `220 31% 9%` |
| `src/components/events/LookingForPlayersBanner.tsx` | Add `text-foreground` to title text |
| `src/pages/EventDetail.tsx` | Pull MatchResultEntry out of the Match Details card into its own prominent card for past matches |

