

# Harmonize Public/Private Toggle + Show Declined Events

## Two changes needed

### 1. Always show the Public/Private toggle (all event types, including team events)

Currently the toggle only appears for non-pickup, non-team events. Users should always have control over visibility regardless of event type.

**File: `src/components/events/UnifiedEventForm.tsx`**

- **Line 328**: Change `showPublicToggle` from `!isPickupGame && !teamId` to `true` -- always show the toggle
- **Line 175**: Default `isPublic` already defaults to `true` when no team -- this stays correct
- **Line 281**: The `is_public` submission logic already respects `values.isPublic` as the user's explicit choice -- no change needed

| Scenario | Default | User can override? |
|---|---|---|
| Pickup game (no team) | Public | Yes (toggle shown) |
| Match/Workout without team | Public | Yes (toggle shown) |
| Hangout without team | Public | Yes (toggle shown) |
| Any event with team | Private | Yes (toggle shown) |

### 2. Show declined events in Discover tab

Users who declined an event can no longer find it anywhere. Fix: only hide events where the user is `attending` or `maybe` (those appear in "Attending" tab already).

**File: `src/hooks/useDiscoverEvents.ts`**

- **Line 53**: Change the filter from `a.status === "attending" || a.status === "not_attending"` to `a.status === "attending" || a.status === "maybe"`

This means declined events reappear in Discover, letting users change their mind and RSVP again.

## Technical details

| File | Line | Change |
|---|---|---|
| `src/components/events/UnifiedEventForm.tsx` | 328 | `showPublicToggle = true` |
| `src/hooks/useDiscoverEvents.ts` | 53 | Replace `"not_attending"` with `"maybe"` |

Two single-line edits. No database or schema changes needed.

