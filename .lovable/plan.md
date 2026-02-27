

# UX/UI Critique and Fixes for Event Creation Wizard

## Issues Found

### Critical
1. **Enter key submits the form early** — pressing Enter in any text field (title, location) triggers `form.handleSubmit`, creating the event and skipping remaining steps entirely. This is the "event creates without checking options" bug.

### Layout
2. **Address dropdown still clipped** — the suggestions list is `position: absolute` inside `AddressAutocomplete`, but the parent scrollable container (`flex-1 overflow-y-auto` on line 1200) clips it. The `StepCard` overflow fix only removed one layer; the outer scroll container is the real culprit.
3. **No step heading inside cards** — the only step label is an 11px subtitle under the dots. Each card needs a bold title so users know what they're filling in.

### Visual Design
4. **Ghost inputs have zero affordance** — borderless transparent inputs with 50% opacity placeholders look like static text, not editable fields. Users miss them. They need a subtle bottom border or a light background well.
5. **FieldRow icons too weak** — 16px muted-foreground icons don't anchor the rows visually. They should sit inside a tinted circle (like Apple/iOS settings rows).
6. **Options step is a wall of toggles** — 6+ rows of switches/selects with identical visual weight. Needs grouping: "Essentials" (visibility, cost, max players) vs "Advanced" (recurrence, RSVP, looking for players, intensity) with a collapsible divider.
7. **StepDots progress is generic** — just dots + tiny text. A numbered step indicator with the step name would be clearer and more modern (e.g., "2 of 4 · When & Where").
8. **Next button doesn't preview next step** — "Next" is vague. Should say "Next: When & Where" so users know what's coming.

## Changes

| File | Change |
|------|--------|
| `src/components/events/UnifiedEventForm.tsx` | 1. **Fix Enter key**: wrap `onSubmit` to call `goNext()` on non-last steps instead of submitting. 2. **Fix dropdown clipping**: change outer scroll container to `overflow-y-auto overflow-x-hidden` and add `overflow-visible` to the step content when on the location step (step 2), or better: render the address dropdown via a portal. Simpler fix: give the scroll area extra bottom padding so the dropdown has room. 3. **Add step heading** inside each `StepCard` — bold title + subtle description. 4. **Restyle ghost inputs** — add `border-b border-border/40 focus:border-primary` for visual grounding. 5. **Upgrade FieldRow icons** — wrap icon in a `h-8 w-8 rounded-full bg-primary/8 flex items-center justify-center` container. 6. **Group Options step** — split into "Essentials" group (visibility, cost, max) and a collapsible "More options" section (recurrence, RSVP, looking for players, intensity). 7. **Replace StepDots** with a text indicator: "Step 2 of 4 · When & Where" in the header area. 8. **Next button label** — show "Next: {nextStepLabel}" instead of just "Next". |
| `src/components/location/AddressAutocomplete.tsx` | Add `min-h-[200px]` spacing below the input's parent when suggestions are showing, so the dropdown is always visible within the scroll container without needing a portal. |

