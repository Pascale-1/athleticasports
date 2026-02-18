
# Reorder & Slim Down the Event Creation Form

## Current Order (problems)
1. Event type selector
2. Sport & Team section
3. Meetup category
4. Match details (opponent, home/away)
5. Title + Visibility toggle
6. Training intensity
7. When (date, start time, duration)
8. Where (location)
9. "More options" button
10. Inside "More options": description, cost, max participants, recurrence, RSVP deadline, looking for players

## Requested Order
1. Event type selector *(keep first)*
2. Sport *(if applicable)*
3. Title
4. Description (note) — visible, not hidden inside "more options"
5. Date & Time
6. Place (address)
7. Team(s) *(if applicable: your team + opponent for matches)*
8. Public / Private visibility
9. Cost + payment link
10. "More options" → max participants, recurrence, RSVP deadline, looking for players, training intensity, meetup category, match home/away

## Changes to Form Sections

### Sections moved OUT of "More options" → always visible:
- **Description** — a compact textarea always shown (replacing the hidden "tap to expand" pattern)
- **Cost & payment link** — moved from inside "More options" to a visible section

### Sections moved INTO "More options":
- Training intensity
- Meetup category
- Match home/away toggle
- Max participants
- Recurrence
- RSVP deadline
- Looking for players

### Sections reordered:
- Sport moves before Title
- Team(s) moves after Place (address), before Visibility
- Visibility (Public/Private) comes after Teams
- Cost section follows Visibility

## Vertical Size Reduction

Each `FormSection` currently uses `p-3 space-y-2.5`. Changes to reduce height:
- `p-2.5` padding instead of `p-3`
- `space-y-2` instead of `space-y-2.5`
- Description textarea: `min-h-[36px]` instead of `min-h-[48px]`, `rows={2}` (compact)
- Inputs: keep `h-9` (already done in most) — some are `h-10`, reduce those to `h-9`
- FormSection header: already compact at `text-xs`
- Remove the `showDescription` state entirely — description is always visible as a small inline textarea

## Technical Details

### State to Remove
- `showDescription` state and its toggle button — description will be a plain always-visible textarea

### New Rendering Order in JSX (inside `<div className="space-y-3">`)
```text
1. EventTypeSelector
2. Sport selector (FormSection, if applicable)
3. Title field (plain input, no FormSection wrapper needed — inline)
4. Description textarea (always visible, compact)
5. When section (date + time + duration)
6. Where section (location/address)
7. Team section (your team + opponent for matches, if applicable)
8. Visibility toggle (if not match pickup game)
9. Cost section (always visible, collapsible payment link only when amount > 0)
10. "More options" button + collapsible containing:
    - Max participants
    - Recurrence
    - RSVP deadline
    - Looking for players
    - Training intensity (training only)
    - Meetup category (meetup only)
    - Match home/away + opponent details (match only)
```

### Match-specific logic
- Opponent section and home/away currently render above Title. They will move into "More options" since title is auto-generated for matches and the user can still tweak details in "More options".
- The pickup game banner (open game indicator) currently lives in the Match Details section — it will move to just below the team selector row, as an inline info chip.

### No DB / translation / schema changes needed.

## Files Changed

| File | Change |
|------|--------|
| `src/components/events/UnifiedEventForm.tsx` | Reorder all JSX sections; remove `showDescription` state; move description to always-visible compact textarea; move cost section above "More options"; move match details, training intensity, meetup category into "More options"; reduce padding/spacing |
