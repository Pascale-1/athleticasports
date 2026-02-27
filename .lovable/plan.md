

# Redesign Team Selectors as Bottom Sheets

## Scope

Two team selectors need redesign:
1. **MyTeamSelector** (user's own team, Step 2) — currently a `<Select>` dropdown
2. **TeamSelector** (opponent picker, Step 2) — currently an inline `<Command>` list with search
3. **Opponent section in UnifiedEventForm** — remove floating "Saisir/Choisir" buttons, restructure

## Changes

### 1. `src/components/teams/MyTeamSelector.tsx` — Full rewrite of UI (keep data logic)

Replace the `<Select>` with a tap-to-open bottom sheet using the existing `Drawer` (vaul) component:

**Closed state (field row):**
- Single row: 36px avatar circle (bg-primary/10, initials in primary color, 14px semibold) + team name in full (no truncation, `break-words`) + `ChevronRight` icon on the right
- If no team selected: muted placeholder text + chevron
- Tapping opens the drawer

**Open state (bottom sheet):**
- `rounded-t-2xl` on DrawerContent, `bg-card` background
- Drag handle bar (already in Drawer component)
- Full-width search input at top: `rounded-xl`, `bg-background`, search icon, placeholder "ex: FC City Rivals..."
- Scrollable list below (`max-h-[50vh] overflow-y-auto`):
  - Each row: 64px height, 16px horizontal padding, `border-b border-border`
  - Avatar (36px, `rounded-full`, `bg-primary/10`, primary text) + team name (semibold, no truncation, wrap allowed) + sport tag below in muted text + check icon if selected
  - Selected row: `border-l-[3px] border-primary bg-primary/5`
  - Pickup game option (if match type): Globe icon + label, same row style
- Footer: "Can't find your team? Create one" as accent-colored text button, centered
- Selecting a team closes the drawer

**Data/logic preserved:** Same `fetchMyTeams`, `matchesSport`, `handleChange`, `QuickTeamCreateDialog` — only the rendering changes.

### 2. `src/components/teams/TeamSelector.tsx` — Full rewrite of UI (keep data logic)

Replace the inline `<Command>` list with a controlled bottom sheet:

**Closed state:**
- Same row style as MyTeamSelector: avatar + name + chevron (or placeholder if none selected)
- `open` / `onOpenChange` controlled by parent or internal state

**Open state (bottom sheet):**
- Same visual pattern as MyTeamSelector's sheet
- Search input at top (reuse existing search/debounce logic)
- Team rows: 64px, avatar, name (no truncation), sport tag, check indicator
- Selected row: accent left border + tint background
- Loading skeleton while fetching
- "Can't find your team? Create one" button at bottom

### 3. `src/components/events/UnifiedEventForm.tsx` — Opponent section (lines 586-667)

**Remove:**
- The "Saisir" / "Choisir" toggle buttons (lines 618-644)

**Replace with:**
- Default mode: manual text input (ghost input for opponent name) — same as current "Saisir" mode
- Inside the opponent TeamSelector bottom sheet footer: add a ghost button "Saisir manuellement" / "Type manually" that switches `opponentInputMode` to `'manual'` and closes the sheet
- When in manual mode, show a small "Pick from list" text link below the input that opens the TeamSelector sheet

This removes the floating mid-screen placement and makes the flow: tap field → bottom sheet opens → either pick a team OR tap "Type manually" in the footer.

## Visual specifications (using existing tokens only)

| Element | Style |
|---------|-------|
| Avatar badge | `h-9 w-9 rounded-full bg-primary/10`, text: `text-primary text-sm font-semibold` |
| Team row | `h-16 px-4 border-b border-border flex items-center gap-3` |
| Selected row | `border-l-[3px] border-primary bg-primary/5` |
| Search input | `rounded-xl bg-background border border-border/50 px-4 h-11` |
| Sheet bg | `bg-card rounded-t-2xl` |
| Create button | `text-primary text-sm font-medium`, centered, in footer |
| Team name | `font-semibold text-sm text-foreground`, no truncation |
| Sport tag | `text-xs text-muted-foreground` |

## Files modified

| File | What changes |
|------|-------------|
| `src/components/teams/MyTeamSelector.tsx` | Replace Select UI with Drawer-based bottom sheet, keep all data fetching and team creation logic |
| `src/components/teams/TeamSelector.tsx` | Replace Command list with Drawer-based bottom sheet, keep search/fetch logic |
| `src/components/events/UnifiedEventForm.tsx` | Remove Saisir/Choisir toggle buttons, add "Type manually" link inside opponent section, restructure opponent FieldRow |

