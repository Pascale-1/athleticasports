
# Fix Font & Layout Alignment Across Event Form

## Problem
The event creation form uses 5 different font sizes for labels (`text-sm`, `text-xs`, `text-[11px]`, `text-[10px]`, default) and 2 different input heights (`h-9`, `h-10`). Meetup category labels at `text-[11px]` inside `h-9` buttons are nearly unreadable (e.g., "Watch Party", "Fitness" text is too small to see). Placeholder text sizes also vary between components.

## Design System for the Form

Standardize on exactly 3 tiers:
- **Section headers** (When, Where, Opponent): `text-xs font-medium` (12px)
- **Field labels** (Sport, Team, Title, Date, Time, etc.): `text-xs` (12px) -- same size, no more `text-sm` or `text-[10px]` variation
- **Hint/secondary text**: `text-[11px] text-muted-foreground` (11px)
- **All inputs, selects, buttons**: height `h-9`, inner text `text-xs` (12px)
- **Meetup category buttons**: `text-xs` (12px) instead of `text-[11px]`, height stays `h-9`

## Changes

### 1. `src/components/events/SportQuickSelector.tsx`
- Line 36: Change label from `text-sm font-medium` to `text-xs font-medium` to match all other form labels
- Line 42: Add `className="h-9 text-xs"` to SelectTrigger to match form input height and text size

### 2. `src/components/events/EventTypeSelector.tsx`
- Line 27: Change label from `text-sm font-medium` to `text-xs font-medium`
- Line 47: Keep `text-xs font-medium` on button text (already correct)
- Line 51: Change description from `text-xs` to `text-[11px]` for hierarchy (hint tier)

### 3. `src/components/teams/MyTeamSelector.tsx`
- Line 193: Add `className="text-xs"` to the Label
- Line 253: Change SelectTrigger from `h-10` to `h-9 text-xs` to match all form inputs

### 4. `src/components/events/UnifiedEventForm.tsx`
Multiple alignment fixes:

**Sub-labels promoted to `text-xs`** (remove `text-[10px]`):
- Line 443 (Date label): `text-[10px] text-muted-foreground` to `text-xs text-muted-foreground`
- Line 487 (Start Time label): same fix
- Line 499 (Duration label): same fix
- Line 560 (Virtual Link label): same fix
- Line 667 (Match Format label): same fix

**Meetup categories readable**:
- Line 395: Change button text from `text-[11px]` to `text-xs` so category names ("Watch Party", "Fitness", etc.) are actually legible

**Button text in match section**:
- Line 524 (location mode buttons): `text-[10px]` to `text-xs`
- Line 608-611 (opponent select/manual buttons): `text-[10px]` to `text-xs`
- Line 650 (home/away buttons): `text-[10px]` to `text-xs`

**Visibility hint text**:
- Lines 366-376 (pickup/team hint): keep `text-[10px]` (this is genuinely secondary hint text, the one exception)

**RSVP/deadline preset pills**:
- Line 796: Change `text-[10px]` to `text-xs` on deadline preset buttons for readability

**Input placeholder alignment** -- already handled by Input component using `text-body`, but form inputs with explicit `text-xs` override it. This is fine since `text-xs` (12px) and `text-body` (11px) are close. The explicit `text-xs` on inputs ensures consistency.

### Summary of impact
- Label sizes: 5 variants reduced to 2 (labels: `text-xs`, hints: `text-[11px]`)
- Input heights: unified to `h-9` everywhere
- Meetup categories: text bumped from 11px to 12px -- now legible
- Match section buttons: text bumped from 10px to 12px -- now readable
- All 3 sub-components (SportQuickSelector, EventTypeSelector, MyTeamSelector) aligned with the form's design system
