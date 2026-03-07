

## Make Match Result Readable With Team Names

### Problem
When a result is saved (e.g. "3 - 1"), the display only shows the raw score with a Win/Loss/Draw badge. There's no indication of which number belongs to which team. Users can't tell if "3 - 1" means their team scored 3 or 1.

### Solution
Update the saved result display in `MatchResultEntry` to show team names alongside the score, matching the same layout used in the score entry form.

### Changes

**File: `src/components/events/MatchResultEntry.tsx`**

Replace the simple `matchResult` text display (lines 86-100) with a structured layout:

```text
Before:  "3 - 1"  [Win]

After:   Your Team    Opponent
           3     -      1      [Win]
```

Specifically:
- Parse the saved `matchResult` string ("3 - 1") into home/away scores
- Use the same `homeAway` logic to determine which label goes where (team name vs opponent name)
- Display team names above each score, mirroring the entry form layout
- Keep the outcome badge (Win/Loss/Draw)

This is a single component change -- roughly 15 lines replacing the current plain text display with a two-column score layout that includes team name labels.

