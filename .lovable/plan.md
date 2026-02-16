

# Mandatory Fields Per Event Type + Fix Placeholder Visibility

## Current Problem

All event types show the same "More options" fields, making the form feel bloated. Some fields are irrelevant for certain types. Additionally, the Title input is missing `text-xs`, causing inconsistent placeholder rendering compared to other fields.

## Mandatory Fields Per Event Type

### Training (Workout)
**Always visible (essentials):**
- Sport selector
- Team selector  
- Title
- When (Date, Time, Duration)
- Where (Location)

**In "More options":**
- Visibility (public/private)
- Description
- Max Participants
- Recurrence
- Cost
- RSVP Deadline
- Looking for Players

### Meetup (Hangout)
**Always visible (essentials):**
- Category (watch party, social, etc.)
- Title
- When (Date, Time, Duration)
- Where (Location mode + address/link)
- Payment Link (relevant for social events with booking)

**In "More options":**
- Visibility (public/private)
- Description
- Max Participants
- Recurrence
- Cost
- RSVP Deadline

**Hidden:** Looking for Players (not relevant for social events)

### Match
**Always visible (essentials):**
- Sport selector
- Team selector (with pickup game option)
- Opponent section
- Home/Away toggle
- Match Format
- Title (auto-generated from teams)
- When (Date, Time, Duration)
- Where (Location)

**In "More options":**
- Description
- Max Participants
- Recurrence
- Cost
- RSVP Deadline
- Looking for Players

**Hidden:** Visibility toggle (auto-set: pickup = public, team = private), Payment Link (not relevant for competitive matches)

## Fix: Placeholder Font Consistency

### Problem
The Title `<Input>` at line 505 has `className="h-9"` but no `text-xs`, so placeholder text renders at the default body size while all other inputs use `text-xs`. This makes placeholders inconsistent and sometimes clipped.

### Solution
Add `text-xs` to:
- Title input (line 505)
- Any other inputs missing it

## Technical Changes

### File: `src/components/events/UnifiedEventForm.tsx`

1. **Title input (line 505):** Change `className="h-9"` to `className="h-9 text-xs"`

2. **Payment Link section (lines 659-672):** Wrap in conditional — only show for `training` and `meetup`, hide for `match`:
   ```
   {eventType !== 'match' && (
     <div className="space-y-1.5">...</div>
   )}
   ```

3. **Visibility toggle in "More options" (lines 698-722):** Hide for `match` type since it's auto-determined:
   ```
   {eventType !== 'match' && (
     <FormField ... isPublic ... />
   )}
   ```

4. **Looking for Players in "More options" (line 934):** Already conditionally shown via `showLookingForPlayersSection` (match + training only) -- no change needed, this is correct.

5. **Location mode toggle (lines 597-616):** Already conditionally shown via `showLocationMode` (meetup only) -- correct.

## Summary of Changes

| Field | Training | Meetup | Match |
|---|---|---|---|
| Sport | Essential | Hidden | Essential |
| Team | Essential | Hidden | Essential |
| Category | Hidden | Essential | Hidden |
| Opponent | Hidden | Hidden | Essential |
| Home/Away | Hidden | Hidden | Essential |
| Format | Hidden | Hidden | Essential |
| Title | Essential | Essential | Essential |
| When | Essential | Essential | Essential |
| Where | Essential | Essential | Essential |
| Location Mode | Hidden | Essential | Hidden |
| Payment Link | Essential | Essential | Hidden |
| Visibility | More options | More options | Hidden (auto) |
| Description | More options | More options | More options |
| Max Participants | More options | More options | More options |
| Recurrence | More options | More options | More options |
| Cost | More options | More options | More options |
| RSVP Deadline | More options | More options | More options |
| Looking for Players | More options | Hidden | More options |

### Files Modified
- `src/components/events/UnifiedEventForm.tsx` only (3 small changes)

