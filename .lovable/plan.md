

# Fix: Always Show Attendee Count on Event Cards

## Problem
Line 279 of `EventCard.tsx` conditionally renders the participant count only when `attendeeCount > 0` OR `max_participants` is set. Events with 0 attendees and no max show nothing.

## Solution
One small change in `EventCard.tsx` — always show the attendee count regardless of whether max_participants is set.

### Change in `src/components/events/EventCard.tsx` (line 279)
Replace:
```tsx
{(attendeeCount > 0 || event.max_participants) && (
```
With:
```tsx
{(attendeeCount >= 0) && (
```

This ensures every event card always displays the `👥 0`, `👥 3`, or `👥 3 / 10` count. The `/max` part still only appears when `max_participants` is set — keeping it optional as designed.

No database, form, or logic changes needed. `max_participants` remains optional.

