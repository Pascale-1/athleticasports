

# Revamp Event Creation: Multi-Step Wizard Layout

## Current State
The `UnifiedEventForm.tsx` (1086 lines) renders all fields in a single scrollable view inside a dialog. It uses icon-anchored rows with dividers (Strava inline style). The `CreateEventDialog.tsx` wraps it in a basic `Dialog`.

## Proposed Architecture
Convert to a **4-step card-based wizard** with progress dots, fade+slide transitions, and a sticky bottom CTA. All existing fields, state, logic, validation, and data flow remain 100% untouched.

### Step Groupings

```text
Step 1: "What"         Step 2: "Details"       Step 3: "When & Where"    Step 4: "Options"
┌──────────────┐      ┌──────────────┐        ┌──────────────┐          ┌──────────────┐
│ Event Type   │      │ Sport        │        │ Date picker  │          │ Visibility   │
│ Title        │      │ Team         │        │ Time         │          │ Cost         │
│ Description  │      │ Opponent     │        │ Duration     │          │ Max players  │
│              │      │ Home/Away    │        │ Location     │          │ Recurrence   │
│              │      │ Category     │        │ Virtual link │          │ RSVP deadline│
│              │      │              │        │              │          │ Looking 4 P  │
│              │      │              │        │              │          │ Intensity    │
│              │      │              │        │              │          │ Category     │
└──────────────┘      └──────────────┘        └──────────────┘          └──────────────┘
     [Next →]              [Next →]                [Next →]              [Create Event]
```

### Files to Change

| File | Change |
|------|--------|
| `src/components/events/UnifiedEventForm.tsx` | Wrap field groups in step containers, add step state + progress dots + step navigation, add framer-motion page transitions, restyle FieldRow for card-based layout, sticky bottom CTA with safe-area padding |
| `src/components/events/CreateEventDialog.tsx` | Update dialog container classes for the new wizard layout (remove overflow constraints that conflict) |
| `src/components/events/EventTypeSelector.tsx` | Restyle to pill/segment control that fits inside a card (rounded-2xl, larger tap targets) |

### Visual Design Details

- **Progress indicator**: Fixed at top — small dots with active/completed states, step label below
- **Cards**: `rounded-2xl bg-card/80 backdrop-blur border border-border/50 shadow-sm` — one card per step
- **Transitions**: `framer-motion` AnimatePresence with `x` slide + opacity fade (already imported)
- **Bottom CTA**: Sticky container with `pb-safe` (safe area), 16px gap from last field, full-width button with 48px height
- **Inputs**: Keep existing ghost inputs but add subtle bottom borders for visual grounding inside cards
- **Tap targets**: All buttons/toggles get `min-h-[48px]` for mobile compliance
- **Step 2 conditional**: If no sport/team/opponent fields are visible (e.g., meetup without category), auto-skip to step 3
- **Dark mode**: Uses existing theme tokens — `bg-background`, `text-foreground`, `border-border` — already dark-mode-first

### What Does NOT Change
- No field additions, removals, or renames
- No schema/validation changes
- No state management changes
- No data flow or submit logic changes
- No hook changes
- `handleSubmit`, all `useEffect`s, all state variables remain identical

