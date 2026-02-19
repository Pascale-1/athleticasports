
# Event Form: Full Modern Redesign — Final Pass

## What the Form Currently Looks Like (Code Audit)

After reading all 1,096 lines of `UnifiedEventForm.tsx` plus every related component, here is what is actually rendering versus what was intended:

### Problems Confirmed

**1. Dialog title duplicates the form tabs**
`CreateEventDialog` renders a `DialogHeader` with a title ("New Training / New Game / New Social") AND the form renders its own `EventTypeSelector` tabs directly below. This creates a redundant header — the dialog title and the tab bar both say the same thing. Strava, Meetup, and Google Calendar all eliminate the modal title and let the type selector speak for itself.

**2. The date row is the most broken field**
The date row shows a plain ghost text "Pick a date" but there is no visual affordance that it is interactive. When a date IS selected, it renders a second row (time + duration picker) inside a `bg-muted/30 border` box inside the same FieldRow. This creates an inconsistent double-height row that doesn't match the ghost style of the other rows. Apple Calendar and Strava solve this with an inline expanding panel.

**3. Visibility and Cost rows feel like settings, not form fields**
The `Switch` toggle is right-aligned on both the Visibility and Cost rows, but the left side just shows text — no visual affordance that these are toggleable. The switch feels orphaned. The modern pattern (Strava, Luma) puts the toggle label inline as part of the row, not as a separate paragraph.

**4. "More options" is visually dull and buried**
The expand button is `pl-7 text-xs text-muted-foreground underline`. It looks like a small link, not a section header. Inside, the items use inconsistent spacing (`py-2.5 pl-7`, `py-2.5 pl-6`, `pl-6`, `pl-7`) — no consistent alignment.

**5. The type tabs have no animation / active indicator weight**
`border-b-2 border-primary` is applied but the tab labels use `text-sm font-medium` for both active and inactive. Active tabs should use `font-semibold` to visually distinguish them. Additionally the tab bar has `mb-1` below it before the form body — creating a noticeable gap before the first field.

**6. Sport dropdown `SelectTrigger` has no visible value display**
The sport select uses `value={selectedSport || '__none__'}` but `__none__` is not a `SelectItem` so Radix returns an empty display. The custom `SelectValue` children rendering approach (where a child renders when there's a value) is the correct fix but needs to be verified — the current code may be silently failing to show the selected sport name.

**7. The entire form sits in a `divide-y divide-border` wrapper — but FieldRow also has `border-b border-border`**
This creates **double borders** on every row. Both `divide-y` on the parent AND `border-b` on each `FieldRow` separator prop are fighting each other. The fix: use only one approach — keep `divide-y` on the wrappers and remove `separator` from `FieldRow`, OR remove `divide-y` and let `FieldRow` handle its own border.

---

## Target: What Modern Apps Do

Looking at Strava's segment creation, Luma's event form, and Apple Calendar:

```text
┌─────────────────────────────────────────┐
│ ✕  New Event              [Training ▾]  │  ← close btn + type in header
├─────────────────────────────────────────┤
│ ✏  Nom de la séance                     │  ← large, prominent
│ ─────────────────────────────────────── │
│ 📝 Description (optional)               │
├─────────────────────────────────────────┤
│ 🏋 Padel ▾                              │  ← sport dropdown, inline
│ ─────────────────────────────────────── │  
│ 👥 Mon équipe ▾                         │
│ ─────────────────────────────────────── │
│ ⚔️ Adversaire         Type · Pick       │  ← match only
│    ● Dom  ○ Ext  ○ Neutre               │
├─────────────────────────────────────────┤
│ 📅 Sam, 8 Mar · 19:00 · 1h30           │  ← tappable row
│    [── date panel expands ──]           │
│ ─────────────────────────────────────── │
│ 📍 Stade Charléty, Paris                │
│ ─────────────────────────────────────── │
│ 🌐 Public              ●               │  ← switch same line as label
│ ─────────────────────────────────────── │
│ €  Free                ○               │
├─────────────────────────────────────────┤
│ ∨  More options                         │
│ ─────────────────────────────────────── │
│          [ Create Training ]            │
└─────────────────────────────────────────┘
```

---

## 7 Surgical Fixes

### Fix 1 — Remove dialog title, move type into dialog header area

**In `CreateEventDialog.tsx`**: Remove the `DialogHeader` + `DialogTitle`. Instead, move the `EventTypeSelector` tabs to the very top of the dialog — flush with the dialog top, acting as the title bar. This eliminates redundancy and gives the tabs more visual weight.

The `DialogContent` needs `pt-0` so the tabs touch the top. The form starts immediately after the tab bar.

**In `EventTypeSelector.tsx`**: Increase tab label from `font-medium` to `font-semibold` on the active tab. The border-bottom is already `border-primary`. Add `gap-2` between icon and label.

### Fix 2 — Fix the double-border bug

**In `UnifiedEventForm.tsx`**: The `<div className="divide-y divide-border">` wrapper already handles row separation. Remove the `separator` prop usage from all `FieldRow` calls (set `separator={false}`) because `divide-y` does the same job. This eliminates the double-border.

The current `FieldRow` has `border-b border-border` when `separator=true`. Since all calls already use `separator={false}`, the `divide-y divide-border` on the parent is doing the work. BUT the `divide-y` wraps only some rows — the sport/team/opponent block is in one wrapper, and date/location/visibility/cost in another. The gap between sections is the `SectionDivider`. This is fine — just ensure every `FieldRow` that is inside a `divide-y` wrapper uses `separator={false}`.

### Fix 3 — Date row: always show time + duration inline (no collapsing sub-row)

Currently: date trigger is a ghost text → on date pick, a secondary `bg-muted/30 border` box appears below for time + duration.

Fix: Remove the collapsing time+duration sub-box. Instead:
- Before date is picked: `"📅 Pick a date"` ghost text
- After date is picked: replace with two rows:
  - Row 1 (date): `"📅 Sat, Mar 8"` — tappable to change
  - Row 2 (time + duration, no icon, indent): `"19:00 · 1h30"` inline with preset pills

This matches how Luma's event creation works. It's always visible, never hides behind a toggle.

### Fix 4 — Visibility + Cost rows: Single-line switch pattern

Currently, both rows have a `<div className="flex items-center justify-between">` with a paragraph of text on the left and a Switch on the right. The text has a `<p>` label AND a `<p className="text-xs text-muted-foreground mt-0.5">` description below.

The description lines (`t('form.isPublicDesc')` etc.) add unnecessary height. Remove the secondary description lines. Keep only the single label + switch on one line. This matches every modern form pattern.

For the cost row: when `hasCost=false`, show `"€  Free"`. When `hasCost=true`, show `"€  Paid"` with the amount expanding below. The switch flips between Free/Paid.

### Fix 5 — "More options" chevron: make it look like a real section

Replace the `pl-7 text-xs underline` link with a proper section divider-style toggle:

```tsx
<div className="flex items-center gap-2 py-2">
  <div className="h-px bg-border flex-1" />
  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-0.5 rounded-full border border-border hover:border-foreground/30 transition-all">
    {t('form.moreOptions')}
    <ChevronDown className={cn("h-3 w-3 transition-transform", showMoreOptions && "rotate-180")} />
  </button>
  <div className="h-px bg-border flex-1" />
</div>
```

This is the Notion/Linear pattern for "more settings" — a pill button with lines on both sides. Much cleaner than an underline text link.

### Fix 6 — Fix sport dropdown display (SelectValue sentinel)

The sport `Select` uses `value={selectedSport || '__none__'}`. When `selectedSport` is empty, the value `'__none__'` is set but there is no `<SelectItem value="__none__">`, so Radix shows nothing. The `SelectValue` children override shows the placeholder div but this may not render reliably.

Fix: Use `value={selectedSport || undefined}` so Radix treats an empty sport as truly uncontrolled placeholder state, and it shows the `placeholder` prop of `SelectValue`. Add a proper `SelectItem value="">` as a non-selectable placeholder item:

```tsx
<Select
  value={selectedSport || ''}
  onValueChange={(val) => { setSelectedSport(val); ... }}
>
  <SelectTrigger ...>
    <SelectValue placeholder={lang === 'fr' ? 'Quel sport ?' : 'Which sport?'} />
  </SelectTrigger>
  <SelectContent>
    {allSports.map(sport => (
      <SelectItem key={sport.id} value={sport.id}>
        {sport.emoji} {getSportLabel(sport.id, lang)}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

The key insight: Radix `Select` shows the `placeholder` when `value` is `''` (empty string). No sentinel needed.

### Fix 7 — Consistent internal spacing in "More options"

All items inside "More options" currently use inconsistent padding (`pl-6`, `pl-7`, no indent). Fix: wrap all items in a consistent `divide-y divide-border` with uniform `py-3 gap-3` using the same `FieldRow` pattern as the main form, but with smaller `py-2.5` sizing. Remove the manual `pl-7` hacks.

---

## Files Changed

| File | What changes |
|------|-------------|
| `src/components/events/CreateEventDialog.tsx` | Remove `DialogHeader`/`DialogTitle`. Move `EventTypeSelector` to the very top of the dialog. Add `pt-0` to `DialogContent`. Pass `onTypeChange` state to display in header. |
| `src/components/events/EventTypeSelector.tsx` | Active tab: `font-semibold` (was `font-medium`). Icon: `gap-2` between icon and label. Tab bar: `mb-0` (remove bottom margin gap). |
| `src/components/events/UnifiedEventForm.tsx` | Fix 7 items: double-border, date row always visible, visibility/cost single-line, more-options pill toggle, sport dropdown empty state, consistent more-options spacing. |

No database changes. No new packages. No translation additions.

## Before/After Summary

| Element | Before | After |
|---------|--------|-------|
| Dialog header | Title text ("New Training") + tabs below | Tabs only, flush to top |
| Active tab | `font-medium` border-b | `font-semibold` border-b primary |
| Double border | `divide-y` + `border-b` on each row | `divide-y` only |
| Date row | Ghost text → collapses open time+duration box | Ghost text → time+duration inline always |
| Visibility/Cost | Label + description paragraph + switch | Single-line label + switch |
| More options toggle | Small underline text link `pl-7` | Centered pill button with hr lines |
| Sport dropdown | May show blank when no sport selected | Correctly shows placeholder |
| More options content | `pl-6`/`pl-7` inconsistent | Consistent `FieldRow` pattern |
