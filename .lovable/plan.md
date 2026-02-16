

# Fix All Truncation and Density Issues in Event Creation Form

## Issues Still Present After Last Fix

### 1. Cost/Tarif buttons still wrapping
The `grid grid-cols-2` fix was applied, but the French labels "Paiement en ligne" (14 chars) and "Partager les frais" (18 chars) are too long for `h-7` (28px) buttons with `text-xs`. The text overflows or gets cut.

**Fix**: Increase button height to `h-8`, add `whitespace-nowrap` and `truncate` to prevent awkward line breaks. Also shorten French labels in `fr/events.json`:
- "Paiement en ligne" -> "En ligne"  
- "Partager les frais" -> "Partager"

### 2. Meetup category buttons - text/icons still invisible
The `flex-row` fix was applied, but the buttons are in a `grid grid-cols-2 min-[360px]:grid-cols-3` with `h-9`. On narrow screens (< 360px), 2 columns means more room, but at 3 columns the emoji + label get cramped.

**Fix**: Force `grid-cols-3` always (categories are short: "Visionnage", "Apéro", "Repas", "Social", "Fitness", "Autre"). Add `justify-center` and ensure no `overflow-hidden` anywhere. Increase to `h-10` for comfortable tap targets.

### 3. Location mode "Sur place" / "En ligne" / "Hybride" cut off
The `h-9` + `text-xs` fix was applied, but the `<span className="text-xs truncate">` with `truncate` is actively cutting the text. The `truncate` class needs to be removed since these labels are short enough.

**Fix**: Remove `truncate` from the text span inside location mode buttons. The labels are only 2-3 words max - they fit without truncation at `text-xs` in 3 columns.

### 4. General placeholder visibility
Some Input fields use the default `text-body` size from the Input component (line 12 of input.tsx: `h-12`), while the form overrides with `h-9 text-xs`. This inconsistency can cause placeholder text to not be fully visible. Ensure all form inputs consistently use `h-9 text-xs` or `h-10 text-sm`.

## Changes

### File: `src/i18n/locales/fr/events.json`

Shorten cost labels to fit compact buttons:
- `cost.online`: "Paiement en ligne" -> "En ligne"
- `cost.split`: "Partager les frais" -> "Partager"
- `cost.onSite`: "Sur place" stays (already short)

### File: `src/components/events/UnifiedEventForm.tsx`

**Location mode buttons (line 612):**
Remove `truncate` from the span so "Sur place" displays fully:
```
<span className="text-xs">{t(`form.locationMode.${mode}`)}</span>
```

**Meetup category buttons (lines 396-408):**
Change grid to always `grid-cols-3` and increase height to `h-10`:
```
<div className="grid grid-cols-3 gap-1.5">
  ...
  className="h-10 flex flex-row items-center justify-center gap-1.5 text-xs px-1.5"
```

**Cost buttons (lines 828-840):**
Increase height to `h-8` to prevent text clipping:
```
className="h-8 text-xs px-2 truncate"
```

## Summary

All changes are small CSS tweaks + 2 shortened French labels. No logic changes, no structural refactoring.

