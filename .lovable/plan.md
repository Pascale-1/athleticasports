

## Fix W-L-D Layout + Show Match Result on Event Card

### Issue 1: W-L-D record breaks layout in TeamQuickStats
The record string "0-0-0" uses `text-2xl font-bold` which is too large for a 3-column grid on mobile, especially with wider numbers like "12-3-5". 

**Fix in `TeamQuickStats.tsx`:**
- Reduce record font size from `text-2xl` to `text-lg`
- Display as styled W/L/D with color-coded numbers instead of plain string: `<span class="text-green-600">3</span>-<span class="text-red-500">1</span>-<span class="text-yellow-500">0</span>`
- Reduce icon size from `h-8 w-8` to `h-6 w-6` and padding from `p-4` to `p-3` across all three cards for a tighter, mobile-friendly layout

### Issue 2: Match result not visible on EventCard
The result entry is only in EventDetail (the detail page). On the card list view, past matches show no score. Users expect to see the final score at a glance.

**Fix in `EventCard.tsx`:**
- For past match events that have a `match_result`, show it inline on the card
- Add a small result badge between the title and the date row, e.g.: `"3 - 1"` with a trophy icon and a colored outcome badge (green/red/yellow)
- Requires the `EventCard` props to accept `match_result` and `match_outcome` (both already on the `Event` type from the DB)
- Only display when `isPast && event.type === 'match' && event.match_result`

### Files to modify
| File | Change |
|------|--------|
| `src/components/teams/TeamQuickStats.tsx` | Smaller sizing, color-coded W-L-D display |
| `src/components/events/EventCard.tsx` | Show match result + outcome badge on past match cards |

