

# Fix "When & Where" Card Alignment

## Problem
The rows inside the "When & Where" card are misaligned:
- **Location row** has extra padding (`p-3 -mx-1`) that shifts it out of alignment with the date, cost, and capacity rows
- The date row, cost row, and capacity row all use a consistent `flex items-center gap-3` pattern with no extra padding
- The location row breaks this pattern, causing the MapPin icon and address text to sit at different indentation than the other rows

## Fix — `src/pages/EventDetail.tsx`

### Location row (lines 431-448)
Remove the `p-3 -mx-1` padding from the location wrapper div so it aligns with all other rows. Apply the same `flex items-center gap-3` pattern used by date, cost, and capacity rows. Keep the hover/group styling but without the extra padding that causes misalignment.

Change:
```
className="flex items-center gap-3 p-3 -mx-1 rounded-lg hover:bg-muted/50 ..."
```
To:
```
className="flex items-center gap-3 rounded-lg hover:bg-muted/50 ..."
```

This single change aligns the location icon box and text with the date block, cost icon, and capacity icon above/below it.

| File | Change |
|------|--------|
| `src/pages/EventDetail.tsx` | Remove `p-3 -mx-1` from location row wrapper (line 434) |

