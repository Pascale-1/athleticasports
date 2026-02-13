

# Fix: Add Event Discovery Tab

## Problem
The Events page has no way to browse public events from other users. The three existing tabs only show:
- Events the user RSVP'd to
- Events the user created
- Events explicitly flagged as "looking for players"

A normal public event created by another user never appears anywhere.

## Solution
Replace the "Open Games" tab with a broader "Discover" tab that shows **all upcoming public events** the user hasn't already joined or declined. Events flagged as "looking for players" will be highlighted with a badge but won't be the only ones shown.

## Technical Changes

### 1. New hook: `src/hooks/useDiscoverEvents.ts`
- Queries `events` table for upcoming events where `is_public = true`
- Excludes events created by the current user
- Excludes events the user has already RSVP'd to (attending or not_attending)
- Includes attendance counts and organizer profile info
- Sorted by start time (soonest first)
- Supports optional sport/type filters

### 2. Update `src/pages/Events.tsx`
- Rename the "Open Games" tab to "Discover" (or "For You")
- Use the new `useDiscoverEvents` hook instead of `useAvailableGames`
- Render results using `EventsList` (same cards as other tabs) instead of `AvailableGameCard`
- Events with `looking_for_players = true` get a "Looking for players" badge
- Update tab icon from `UserPlus` to `Search` or `Compass`

### 3. Update i18n keys
- `src/i18n/locales/en/events.json`: Add `tabs.discover`, `tabs.discoverSubtitle`, `discover.empty`, `discover.emptyDesc`
- `src/i18n/locales/fr/events.json`: Same keys in French
- `src/i18n/locales/en/matching.json`: Keep existing keys (no breaking changes)
- `src/i18n/locales/fr/matching.json`: Same

### 4. No database changes needed
The existing RLS policy "Public events are viewable by everyone" (`is_public = true`) already allows this. Events with `team_id IS NULL` are also visible to all authenticated users via the "Team events viewable by team members" policy.

## What users will see
- A "Discover" tab showing all upcoming public events from other users
- Events they've already joined or declined are filtered out
- Events needing players are highlighted
- Clicking an event goes to the detail page where they can RSVP

