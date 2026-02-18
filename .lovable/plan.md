
# Apply "Inline Magic" Design to the Edit Event Dialog

## What the Edit Dialog Currently Is

The `EditEventDialog` is a completely separate component that still uses the **old card-based design** from before the revolutionary redesign — `Label + Input` pairs stacked with `space-y-4`, a `bg-muted/30 rounded-xl border` card for visibility, and a visually inconsistent cost section with inverted toggle logic. It looks like a different app compared to the polished creation form.

## Gap Analysis: Creation vs. Edit

| Aspect | Creation Form (new) | Edit Dialog (old) |
|--------|--------------------|--------------------|
| Layout | Icon-anchored `FieldRow` rows with `divide-y` | `space-y-4` stacked `Label + Input` pairs |
| Title/Notes | Ghost input, borderless | Bordered `<Input>` with a `<Label>` header |
| Date/Time | Single tappable row → expands to time + duration pills | Separate `<Input type="date">` + 2 `<Input type="time">` side by side |
| Location | `AddressAutocomplete` (ghost style via `DistrictSelector`) | `AddressAutocomplete` with full `<Label>` header |
| Visibility | Clean toggle row with icon that changes Globe/Lock | Card box (`bg-muted/30 rounded-xl border`) with Switch |
| Cost | `hasCost` default `false`, AnimatePresence expand | `isFree` (inverted logic), plain styled section |
| Match fields | Inside "More options" collapsible | Always visible, above visibility |
| Max participants | Inside "More options" | Progressive disclosure ghost button |
| Submit | `w-full h-11` with Loader2 spinner | `flex justify-end` with two buttons |
| Separator style | `divide-y divide-border` between rows | None — open space |

## Redesign Approach

The edit dialog will adopt **every design pattern** from the creation form:

### 1. `FieldRow` component (same definition, local copy)
Same icon-anchored row pattern with `border-b border-border`, `gap-3`, `py-3`, and `iconAlign` prop — defined outside the component to prevent scroll-jump.

### 2. Ghost inputs for Title & Description
- Title: `bg-transparent border-0 outline-none text-sm font-medium` full-width input
- Description: `bg-transparent border-0 outline-none text-sm resize-none` 2-row textarea

### 3. Date/Time as a single collapsed row
- Display: `📅 Sat, Mar 8 · 19:00 → 20:30` (computed from existing start/end times)
- When date row is tapped: show a native `<input type="date">` + time pickers in a `bg-muted/30 rounded-lg border` container, matching the creation form's "time + duration" sub-row pattern
- Keep `startTime` and `endTime` state as-is (edit doesn't use duration, it uses an explicit end time — that distinction is preserved)

### 4. Location as ghost address autocomplete
Remove the `Label` header; the `MapPin` icon in `FieldRow` provides the semantic anchor. `AddressAutocomplete` renders inline.

### 5. Visibility: clean toggle row
Replace the `bg-muted/30 rounded-xl border` card with a `FieldRow` using the Globe/Lock icon (switching based on state), matching the creation form exactly.

### 6. Cost: fix inverted logic + AnimatePresence
- Rename `isFree` → `hasCost` (default `false` = free, toggle ON = paid)
- Add `AnimatePresence` for the expanding cost detail section
- Use the `Link2` + ghost input pill for the payment link, matching creation

### 7. Match fields + Max Participants → "More options"
- Move opponent name, home/away selector, and max participants into a collapsible "More options" section at the bottom
- Use the same `ChevronDown` subtle text link pattern as the creation form
- Interior items use `pl-7` indent and `divide-y divide-border` separation

### 8. Submit actions redesign
- Remove the side-by-side Cancel + Save buttons
- Replace with a full-width `w-full h-11` "Save Changes" button with `Loader2` spinner
- Add a small "Cancel" text link above or the dialog's built-in X close button handles cancel

## Field Order (matching the plan's specification)

```text
1. Title (ghost input, PenLine icon)
2. Description/Note (ghost textarea, AlignLeft icon)
3. Date & Time (single row → expands inline, CalendarIcon)
4. Location (address autocomplete, MapPin icon)
5. Visibility Public/Private (Globe/Lock icon toggle row)
6. Cost/Tarif (Euro icon toggle row, AnimatePresence expand)
7. "More options" text link → collapsible:
   - Max participants
   - Match: Opponent + Home/Away (only for match type)
[Save Changes button - full width]
```

## Files Changed

| File | Change |
|------|--------|
| `src/components/events/EditEventDialog.tsx` | Full redesign: add local `FieldRow`, ghost inputs, collapsed date row, clean visibility row, fixed cost logic with `hasCost`, match details in "More options", full-width submit button. Imports: add `AnimatePresence`, `motion`, `Link2`, `ChevronDown`, `PenLine`, `AlignLeft`, `MapPin`, `Popover`, `Calendar` from existing deps |

No new dependencies needed — `framer-motion`, `lucide-react`, and all UI components are already installed.
No database, schema, or translation changes required.
