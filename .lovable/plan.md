

# Fix Sport Filter Empty State UX

## Problem
When a sport filter returns zero results, the empty state shows "No upcoming events" with a "Create event" CTA. Users interpret this as the filter being broken rather than no events matching.

## Solution
Make the empty state filter-aware across all three tabs. When `activeSport !== 'all'` (or `activeEventType` is set), show a filter-specific message with a "Clear filters" action instead of "Create event".

## Changes

### 1. `src/pages/Events.tsx`
- Create a helper `hasActiveFilters` that checks `activeEventType !== 'all'` or `activeSport !== 'all'` or `filters.searchQuery`
- In the "My" tab empty state (line 519-538): when `hasActiveFilters`, show "No events match your filters" with a "Clear filters" button calling `handleResetFilters`
- In the "Organized" tab empty state (line 430-441): same pattern
- In the "Discover" tab empty state (line 398-409): same pattern

### 2. `src/i18n/locales/en/events.json`
- Add `"empty.noFilterResults": "No events match your filters"`
- Add `"empty.tryDifferentFilters": "Try selecting a different sport or event type"`

### 3. `src/i18n/locales/fr/events.json`
- Add `"empty.noFilterResults": "Aucun événement ne correspond"`
- Add `"empty.tryDifferentFilters": "Essayez un autre sport ou type d'événement"`

