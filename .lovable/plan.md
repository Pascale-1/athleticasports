

# Simplify Event Creation Form -- Faster, Lighter, Modern

## What is "Partager les frais"?

"Partager les frais" is French for **"Split the cost"** -- it means participants split the event cost among themselves (e.g. each person pays their share via Lydia, PayPal, etc.). It's the right label, no change needed.

## Current Problems

The form currently shows **everything at once**: event type, sport, team, title, date, time, duration, location, visibility toggle, description, participants, recurrence, cost/payment chips, RSVP deadline, and looking-for-players -- all in one long scroll. For a quick "let's play football Tuesday at 7pm" event, this is overwhelming.

## Design Approach: Progressive Disclosure

Show only what matters upfront. Hide advanced options behind a single expandable section. The goal: **create a basic event in 5 taps**.

### What stays visible (Essential Fields)
- Event type selector (Match / Workout / Hangout)
- Sport + Team (contextual, same as now)
- Title
- Date + Time (side by side)
- Duration (preset chips)
- Location
- Create button

### What moves into "More options" collapsible
- Visibility toggle (Public/Private)
- Description (+ Add a note...)
- Max participants
- Recurrence
- Cost and Payment
- RSVP Deadline
- Looking for Players
- Match details card (opponent, home/away, format) -- stays visible for Match type since it's essential

### Visual Improvements
- Remove the `<Separator>` line between essentials and options -- replace with a subtle "More options" collapsible trigger
- Add breathing room with slightly larger spacing between the essentials section and the options trigger
- The "More options" row uses a chevron icon that rotates when expanded
- Keep the match details card visible (not collapsible) since opponent info is essential for matches

## Technical Changes

### File: `src/components/events/UnifiedEventForm.tsx`

1. **Add collapsible state**: `const [showMoreOptions, setShowMoreOptions] = useState(false);`

2. **Restructure layout** into two zones:
   - **Zone 1 (always visible)**: Event type, sport, team, category (meetup), title, date/time/duration, location, match details card
   - **Zone 2 (collapsible "More options")**: Visibility toggle, description, participants, recurrence, cost/payment, RSVP deadline, looking for players

3. **Replace the Separator** (line 690) with a "More options" button:
   ```
   <Button variant="ghost" onClick toggle className="w-full justify-between text-xs text-muted-foreground">
     <span>More options</span>
     <ChevronDown rotating />
   </Button>
   ```

4. **Wrap optional fields** (lines 692-937) in a collapsible `AnimatePresence` block that shows/hides based on `showMoreOptions`

5. **Add translations** for "More options" / "Plus d'options" in both locale files

### File: `src/i18n/locales/en/events.json`
- Add `"form.moreOptions"` key (value: "More options") -- already exists as `"moreOptions": "More options"`, just need to use it

### File: `src/i18n/locales/fr/events.json`
- Add/verify `"form.moreOptions"` key (value: "Plus d'options")

## Result

**Before**: ~15 visible fields, long scroll, everything exposed
**After**: ~7 visible fields for quick creation, with "More options" expandable for power users. Same functionality, 60% less visual noise on first load.

