

# Fix Event Detail Layout — Harmonize Typography

## Problem
The event detail page has inconsistent font sizes creating a jarring visual hierarchy. Key offenders:

1. **Capacity number** (`20px bold`) is oversized — dominates the card
2. **Day name** (line 419) has no explicit size, defaults to ~16px — too prominent for secondary info
3. **Opponent name** (line 541) defaults to ~16px — disproportionate
4. **Location text** (line 440) `text-sm` is fine but the "tap to open maps" link below it competes
5. **Match badge** `text-[13px]` is slightly large for inline badges

## Changes — Single file: `src/pages/EventDetail.tsx`

### Capacity row (line 507)
- Change `text-[20px] font-bold` → `text-sm font-semibold` to match the rest of the card's info rows

### Date/time row (lines 419-424)
- Day name: add `text-sm` to match other info text
- Time string: already `text-sm` — good

### Location row (line 440)
- Already `text-sm` — keep as is

### Opponent name (line 541)
- Change `font-medium` → `text-sm font-medium` for consistency

### Match badges (line 548)
- Change `text-[13px]` → `text-xs` to match other badges in the header

### Overall card spacing
- Ensure all info rows use the same pattern: `h-10 w-10` icon box + `text-sm` content — already mostly consistent, just fixing the outliers above

This is purely a typography sizing pass — no structural or functional changes.

