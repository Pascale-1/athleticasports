

# Fix: Make Events Public by Default (No Team)

## Problem
Line 281 in `UnifiedEventForm.tsx` hardcodes `is_public: false` for training and match events (unless pickup game). This means events created without a team are invisible to other users in the Discover tab.

## Changes (single file: `src/components/events/UnifiedEventForm.tsx`)

### 1. Fix `is_public` default logic (line 281)

Change:
```
is_public: isPickupGame ? true : (eventType === 'meetup' ? (values.isPublic ?? !teamId) : false),
```
To:
```
is_public: isPickupGame ? true : (values.isPublic ?? !(selectedTeamId || teamId)),
```

This means: pickup games are always public, events with a team default to private, events without a team default to public. The user can override via the toggle.

### 2. Show the Public/Private toggle for all event types (line 328)

Change:
```
const showPublicToggle = eventType === 'meetup' && !teamId;
```
To:
```
const showPublicToggle = !isPickupGame && !teamId;
```

This shows the toggle for training, match (with team), and meetup events -- not for pickup games (always public).

### 3. Update the visibility indicator (line 332)

Change:
```
const isPublicEvent = isPickupGame || (eventType === 'meetup' && form.watch('isPublic'));
```
To:
```
const isPublicEvent = isPickupGame || form.watch('isPublic');
```

### 4. Update form default value (line 175)

The default `isPublic: !teamId` is already correct -- it defaults to `true` when no team is provided.

## Also: update existing test events in the database

Run a query to set existing events without a team to `is_public = true` so they immediately appear in the Discover tab:
```sql
UPDATE events SET is_public = true WHERE team_id IS NULL AND is_public = false;
```

## Summary

| What | Before | After |
|------|--------|-------|
| Training without team | Private (invisible) | Public by default |
| Match without team (non-pickup) | Private (invisible) | Public by default |
| Meetup without team | Toggle (public default) | Toggle (public default) |
| Any event with team | Private | Private (unchanged) |
| Pickup game | Public | Public (unchanged) |
| Public toggle visibility | Meetup only | All types except pickup |

