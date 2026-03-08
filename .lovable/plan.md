

## Fix: Address Layout, Time Row Wrapping, and Streamline Team Selector

### Problem 1: Address field misaligned
The country `Select` component (52px wide) inside `AddressAutocomplete.tsx` pushes the ghost input field. The `SelectTrigger` adds padding and borders that don't match the ghost style used inside the event form's `FieldRow`.

**Fix in `AddressAutocomplete.tsx`:**
- When `ghost` mode is active, render the country picker as a minimal inline button (just the flag emoji + tiny chevron) instead of a full `Select` component — no border, no padding. This keeps it visually consistent with the borderless ghost input.
- Reduce to ~32px width for the flag button in ghost mode.
- Use a `Popover` for country selection in ghost mode instead of the heavier `Select`.

### Problem 2: Time + Duration wrapping to two rows
`DurationPicker.tsx` line 49 uses `flex flex-wrap` — this allows the preset buttons to wrap. Combined with the time input, they overflow onto a second line.

**Fix in `DurationPicker.tsx`:**
- Change `flex flex-wrap` to `flex flex-nowrap` and add `overflow-x-auto scrollbar-hide` so presets scroll horizontally instead of wrapping.

### Problem 3: Team selector takes too much space
The `MyTeamSelector` in the event form (lines 570-606) opens a full-screen Drawer with search, which is overkill for a simple team pick during event creation. 

**Fix — make team selection inline:**
- In `UnifiedEventForm.tsx`, replace the current `MyTeamSelector` usage with a compact inline pill-style selector (similar to the sport quick selector or home/away toggle already used in the form).
- Show team avatars as small tappable pills: `[🔵 FC Rivals] [🟢 Sunday League] [+ Create]`
- If the user has many teams, show the first 3-4 as pills and a "+N more" that opens the Drawer.
- For the pickup option (match type), show it as the first pill: `[🌍 Pickup]`
- This keeps the flow inline without opening a sheet for most users who have 1-3 teams.

### Files to change
1. **`src/components/location/AddressAutocomplete.tsx`** — Ghost-mode compact country picker
2. **`src/components/events/DurationPicker.tsx`** — `flex-nowrap` + horizontal scroll
3. **`src/components/events/UnifiedEventForm.tsx`** — Inline pill-style team selection replacing Drawer-based MyTeamSelector for event creation context

