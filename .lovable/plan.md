

# RSVP Redesign — Single Button/Pill + Bottom Sheet

Replace the 3-button inline RSVP row with a single contextual element + a Drawer-based bottom sheet for full RSVP control.

## File: `src/components/events/EventCard.tsx`

### Remove inline 3-button RSVP row (lines 193-233)

Replace with a single element in ROW 1's right column area (or as a standalone row):

**Unanswered (`userStatus` is null):** Small outline button "RSVP →"
- `border border-primary text-primary rounded-full h-[26px] px-2.5 text-[11px] font-medium`
- On click: `e.preventDefault()`, open RSVP drawer state

**Answered:** Single status pill
- Going: `bg-success/10 text-success` → "✓ J'y vais"
- Maybe: `bg-primary/10 text-primary` → "? Peut-être"
- Can't Go: `bg-destructive/10 text-destructive` → "✗ Non"
- Same sizing: `rounded-full h-[26px] px-2.5 text-[11px] font-medium`
- On click: `e.preventDefault()`, open RSVP drawer state

Position the button/pill at bottom-right of card after the metadata row, right-aligned.

### Add Drawer (bottom sheet) inside EventCard

Use existing `Drawer` from `@/components/ui/drawer`. Controlled via local `useState<boolean>` (`rsvpSheetOpen`).

Drawer content:
- `DrawerHeader`: event title (14px semibold) + date/location subtitle (12px muted)
- 3 tappable rows, each 48px height, full width:
  - `✓ J'y vais` — highlight with `bg-success/10 text-success` when active
  - `? Peut-être` — highlight with `bg-primary/10 text-primary` when active
  - `✗ Je ne peux pas` — highlight with `bg-destructive/10 text-destructive` when active
  - Inactive rows: `bg-muted text-foreground`
- On row tap: call `onRSVPChange(status)`, close drawer

### Imports to add
- `Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription` from `@/components/ui/drawer`
- `useState` (already imported as `memo, useMemo`)
- Remove `HelpCircle` import (no longer needed)

### No changes to EventsList or other files

The `onRSVPChange` prop contract stays identical. Only the UI presentation changes within EventCard.

