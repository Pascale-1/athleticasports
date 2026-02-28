

# Why the "3" Badge Persists on Events Tab

## Root Cause

The badge in `BottomNavigation.tsx` counts upcoming team events where you have no RSVP record. You currently have 3 such events. The badge only clears when you actually RSVP to those events -- it does **not** clear just by visiting the Events page.

According to the intended behavior (from the feature spec), the badge should also clear when the user views the Events screen.

## Fix

### `src/components/mobile/BottomNavigation.tsx`

Add logic to set `todayEvents` to `0` when the current route is `/events`, so the badge disappears while the user is on that screen:

**Line 82** -- wrap the badge set in a route check:
```tsx
// After computing unansweredCount:
setTodayEvents(location.pathname.startsWith('/events') ? 0 : unansweredCount);
```

Since `fetchBadges` already re-runs on `location.pathname` change (line 87), this will:
- Hide the badge when navigating to `/events`
- Show it again when navigating away (if there are still unanswered events)

One line changed. No other files affected.

