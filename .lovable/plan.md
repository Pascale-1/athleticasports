
# Event Form: Full Modern Redesign

## Core Problem

After reading all 1,055 lines of `UnifiedEventForm.tsx` and the component tree, the form has structural issues that no amount of incremental polish can fix. The problems are:

1. **No visual hierarchy** — Title, Date, Location, Cost all have identical weight. A modern form uses progressive disclosure: the most important fields are prominent, the rest are secondary.
2. **Sport = pills that scroll** — Strava/Meetup use a **dropdown** for sport selection (you asked for this). Pills in a scrollable row are a pattern for filters, not for form input.
3. **"Adversaire" is buried** — The opponent field (key for match events) is hidden in "More options". This is wrong for a match form.
4. **FieldRow pattern is inconsistent** — Some rows use `FieldRow`, others bypass it (sport, more options, etc.), creating inconsistent indentation and spacing.
5. **Type pills look like navigation tabs, not input selectors** — The Training/Game/Social pills at the top look like page tabs, not a segmented control.
6. **"More options" contains too much** — Recurrence, RSVP deadline, Looking for Players, Category — these are all secondary. But they're mixed with important things like Max Participants.

## Target: Strava-style Layout

```text
┌─────────────────────────────────────┐
│  [ Training ] [ Game ] [ Social ]   │  ← Segmented control (underline style)
├─────────────────────────────────────┤
│  ✏️  Nom de la séance               │  ← Ghost input, prominent
│  📝  Description (optional)         │  ← Ghost textarea, secondary
├─────────────────────────────────────┤
│  🏃  Sport ▾  Padel                 │  ← Dropdown (not pills!)
│  👥  Mon équipe ▾  FC Paris         │  ← Ghost select
│  🏆  Adversaire   Entrer nom...     │  ← MATCH ONLY, always visible, ghost input
│      ● Domicile  ○ Extérieur  ○ N.  │  ← MATCH ONLY, compact 3-way toggle
├─────────────────────────────────────┤
│  📅  Sam, 8 Mar · 19:00 · 1h30     │  ← Collapsed date row
│     [date picker expands here]      │
│  📍  Adresse ou lieu                │  ← Ghost location
│  🌐  Public  ————————————  ●       │  ← Visibility toggle row
│  €   Gratuit ————————————  ○       │  ← Cost toggle row
├─────────────────────────────────────┤
│  ⌄  Plus d'options                  │  ← Collapsible, secondary
│     Max participants                │
│     Répétition                      │
│     Limite RSVP                     │
│     Intensité (training only)       │
│     Catégorie (social only)         │
├─────────────────────────────────────┤
│  [      Créer la séance      ]      │  ← Full-width, h-11
└─────────────────────────────────────┘
```

## 8 Precise Fixes

### Fix 1 — Type Selector: Underline segmented control
Replace the rounded pill tabs with an **underline tab bar** — the modern standard (Strava, Instagram, Twitter). Active tab gets a colored underline + bold text, no filled background. This looks like navigation for the form, not a button cluster.

```tsx
// Before: rounded-full pills with bg-primary/10
// After: underline tab bar
<button className={cn(
  "pb-2 text-sm font-medium border-b-2 transition-all",
  isSelected 
    ? "border-primary text-foreground" 
    : "border-transparent text-muted-foreground hover:text-foreground"
)}>
```

### Fix 2 — Sport: Native dropdown (not chips)
Replace `SportQuickSelector` (scrollable chips) with a standard `Select` dropdown showing `{emoji} Sport name`. This is what every mainstream sports app uses and what the user explicitly asked for.

- The `Dumbbell` icon in the FieldRow is the visual anchor
- Placeholder: "Quel sport ?" / "What sport?"
- Dropdown shows all sports with emoji prefix and proper grouping (Featured first, then Others)
- `SelectContent` uses `bg-popover` (no transparency issue)

### Fix 3 — Opponent: Promoted to main fields (match only)
Move the opponent section **out of "More options"** and into the main form body, directly below the team selector. This is what the user asked for explicitly. It only renders when `eventType === 'match'`.

The opponent section becomes a single clean `FieldRow` with a `Swords` (or `Trophy`) icon:
- Ghost text input for opponent name (most common case)
- Small toggle: "Équipe connue / Nom libre" — to switch to `TeamSelector` if needed
- Immediately below: home/away 3-way toggle (`● Dom · ✈ Ext · ⚖ Neutre`) as compact inline pills

### Fix 4 — Remove the FieldRow inconsistency for sport row
The sport row currently bypasses `FieldRow` (uses a raw `div`). Replace it with `<FieldRow icon={Dumbbell}>` wrapping the new dropdown. This makes every single row consistent.

### Fix 5 — "More options" cleanup
After moving opponent + home/away to main fields, "More options" becomes a genuinely secondary section:
- Max participants
- Recurrence 
- RSVP Deadline
- Training Intensity (training only)
- Looking for Players (training/match only)
- Meetup Category (social only)

This is now logically coherent — everything in "more options" is truly optional.

### Fix 6 — Title field: Make it feel like a title
The title ghost input currently has no visual differentiation from description. Use `text-base font-medium` (slightly larger than `text-sm`) so the title reads as a **heading input** — this is the Notion/Linear/Strava pattern.

### Fix 7 — Separator between section groups
Add a slightly heavier visual gap between the "title/desc" group and the "sport/team/opponent" group, and between that and the "date/location/visibility/cost" group. Use a `py-0.5 bg-muted/50` divider — creates breathing room without adding border noise.

### Fix 8 — Submit button: type-aware and tighter top spacing
The submit button already has the right shape (`w-full h-11`). Minor fix: add `mt-2` spacing from the last row (currently `pt-3` which is fine). Keep the `Loader2` spinner. Ensure the button text updates live as type changes.

## Files to Change

| File | What changes |
|------|-------------|
| `src/components/events/UnifiedEventForm.tsx` | Full restructure: sport dropdown, opponent in main body, type selector → underline tabs, title text-base, group dividers |
| `src/components/events/EventTypeSelector.tsx` | Replace pill buttons with underline tab bar |
| `src/components/events/SportQuickSelector.tsx` | No longer used in the form — keep file (used elsewhere), just swap at point of use |

No DB changes. No new packages. No translation changes (all keys already exist).

## Opponent Field Design (main body, match only)

The opponent field in the main body will look like:

```text
🏆  [Nom de l'adversaire]          (ghost text input, manual mode)
    [Équipe app ▾]  [Nom libre ●]  (small mode toggle pills, text-[10px])

    ● Domicile  ○ Extérieur  ○ Neutre   (inline 3-way pills, below)
```

Default mode is "manual" (free text) since most pickup and casual games don't involve a registered team. The "Équipe app" toggle switches to `TeamSelector` dropdown for registered teams. This matches the previous behavior but makes it discoverable by default instead of buried.
