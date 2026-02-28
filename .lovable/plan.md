

# Fix RSVP Deadline and Looking for Participants

## Issues Found

### Looking for Participants
1. **`LookingForPlayersBanner` has wrong calculation**: Uses `maxParticipants || playersNeeded` for `totalSpots`, conflating max event capacity with how many additional players are needed. If `maxParticipants = 10` and `playersNeeded = 4`, it shows "7 spots left" instead of "4 players needed"
2. **EventDetail line 480**: `event.max_participants > stats.attending` fails silently when `max_participants` is null (comparison `null > number` → always `false`), hiding the "looking for" badge
3. **`LookingForPlayersBanner` hides when `spotsRemaining <= 0`** based on max capacity, not based on players_needed fulfillment

### RSVP Deadline
4. **No validation that calculated deadline is in the future**: Setting "24h before" on an event 2 hours away creates a deadline 22 hours in the past → RSVP appears immediately closed
5. **`EditEventDialog` doesn't include RSVP deadline or looking_for_players fields**, so these can't be modified after event creation

## Plan

### 1. Fix `LookingForPlayersBanner` calculation
**File: `src/components/events/LookingForPlayersBanner.tsx`**
- Change `totalSpots` logic: use `playersNeeded` as the number of additional players wanted
- Track how many non-creator attendees have joined
- Show `spotsRemaining = max(0, playersNeeded - currentAttending)` when no `maxParticipants`
- Show `spotsRemaining = max(0, min(playersNeeded, maxParticipants - currentAttending))` when `maxParticipants` is set
- Progress bar should track `playersNeeded` fulfillment, not capacity fill

### 2. Fix EventDetail "looking for" badge null check
**File: `src/pages/EventDetail.tsx`** (line ~480)
- Change `event.max_participants > stats.attending` → `(event.max_participants ?? Infinity) > stats.attending`
- This ensures the badge shows even when `max_participants` is null

### 3. Add RSVP deadline validation in creation form
**File: `src/components/events/UnifiedEventForm.tsx`**
- In `calculateRsvpDeadline`, after computing the deadline, check if it's in the future
- If the calculated deadline is in the past, show a warning and prevent submission with that deadline
- Add a small warning text below the preset buttons when the computed deadline would be in the past

### 4. Add RSVP deadline + looking for players to EditEventDialog
**File: `src/components/events/EditEventDialog.tsx`**
- Add state for `rsvpDeadline` (date string), `lookingForPlayers` (boolean), `playersNeeded` (string)
- Initialize from `event.rsvp_deadline`, `event.looking_for_players`, `event.players_needed`
- Add a Switch row for "RSVP Deadline" with a datetime input when enabled
- Add a Switch row for "Looking for Players" with a number selector when enabled (only for match/training)
- Include these fields in the update payload

### Files changed
1. `src/components/events/LookingForPlayersBanner.tsx` — fix spots calculation
2. `src/pages/EventDetail.tsx` — fix null check on max_participants
3. `src/components/events/UnifiedEventForm.tsx` — add deadline-in-past validation
4. `src/components/events/EditEventDialog.tsx` — add RSVP deadline + looking for players fields

