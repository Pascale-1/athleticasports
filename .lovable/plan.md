

# Fix Dense/Clipped Form Elements in Event Creation

## Issues Identified

1. **Cost/Tarif buttons wrap to 2 lines**: The 4 payment method buttons ("Gratuit", "Sur place", "Paiement en ligne", "Partager les frais") are in a `flex-wrap` container with long French labels that overflow onto a second row.

2. **Meetup category buttons — text/icons not visible**: Buttons use `flex-col` layout cramming an emoji + text label into only `h-9` (36px) height, with `overflow-hidden` clipping content.

3. **Location mode buttons ("Sur place", "En ligne", "Hybride") — text cut off**: The 3-column grid buttons at `h-8` (32px) with an icon + text are too tight, and "Sur place" gets truncated.

## Fixes

### File: `src/components/events/UnifiedEventForm.tsx`

**1. Cost buttons (lines 828-841) — switch to 2x2 grid**
- Change from `flex flex-wrap gap-1.5` to `grid grid-cols-2 gap-1.5`
- This guarantees 2 buttons per row, no wrapping issues
- Keep `h-7 text-xs px-2` sizing

**2. Meetup category buttons (lines 396-409) — fix visibility**
- Change from `flex-col` layout to `flex-row` (horizontal icon + text)
- Remove `overflow-hidden` that clips content
- Keep `h-9` height since content is now single-line horizontal
- Use `gap-1.5` between emoji and label

**3. Location mode buttons (lines 598-616) — fix text clipping**
- Increase height from `h-8` to `h-9` for breathing room
- Add `text-xs` to ensure consistent small text
- Remove `overflow-hidden` from the button class so labels aren't clipped
- Shorten French labels slightly: "Sur place" to "Sur place", "En ligne" stays, "Hybride" stays (they're already short, the issue is the button height + overflow)

### File: `src/i18n/locales/fr/events.json`

No label changes needed — the French labels are already concise. The fix is purely layout/CSS.

## Technical Summary

All changes in `src/components/events/UnifiedEventForm.tsx`:
- Line 403: Category buttons — change class from `flex-col` to `flex-row`, remove `overflow-hidden`
- Line 609: Location mode buttons — remove `overflow-hidden`, increase to `h-9`
- Line 828: Cost section — change from `flex flex-wrap` to `grid grid-cols-2`

