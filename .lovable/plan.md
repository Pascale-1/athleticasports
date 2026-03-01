

# Hybrid Filter Layout: Inline Type Chips + Sport Dropdown

## What changes

### 1. Add Sport dropdown chip to filter row (`src/pages/Events.tsx`)
Append a `🏅 Sport ▾` chip after the existing type chips (and before Declined). Uses a `Popover` with sport list from `SPORTS`. When a sport is selected, chip becomes active showing `🎾 Padel ▾`. Selecting "All Sports" clears.

```text
[All] [🏃 Training] [⚽ Game] [🤝 Meetup] [🏅 Sport ▾] [✕ Declined]
```

- Import `Popover`, `PopoverTrigger`, `PopoverContent` from radix
- Import `getActiveSports`, `getSportEmoji`, `getSportLabel` from `src/lib/sports`
- Add `activeSport` state (default `'all'`)
- Render popover chip between the type chips and Declined chip
- Apply sport filter to `filteredCreatedEvents` and `discoverEvents` inline (simple `.filter()`)
- Wire to `setSportFilter` from useEventFilters

### 2. Add sport filter to `src/hooks/useEventFilters.ts`
- Add `sport: string` field to `EventFilters` (default `'all'`)
- Add filtering logic: when sport is not `'all'`, filter by `e.sport?.toLowerCase() === filters.sport.toLowerCase()`
- Add `setSportFilter` helper
- Include `sport: 'all'` in `resetFilters`

### 3. Show sport name on EventCard type chip (`src/components/events/EventCard.tsx`)
- When `event.sport` exists, append `· SportLabel` to the type chip label (e.g., `🎾 Game · Padel`)
- Use sport-specific emoji instead of the generic type emoji for matches with a sport
- Remove the standalone `sportEmoji` from ROW 5 (line 272) since it's now in ROW 1

### 4. Localization
- `en/events.json`: add `"filters.sport": "Sport"`, `"filters.allSports": "All Sports"`
- `fr/events.json`: add `"filters.sport": "Sport"`, `"filters.allSports": "Tous les sports"`

### Files modified
1. `src/hooks/useEventFilters.ts` — add sport field + filter logic
2. `src/pages/Events.tsx` — add sport popover chip to filter row
3. `src/components/events/EventCard.tsx` — merge sport into type chip, remove standalone emoji
4. `src/i18n/locales/en/events.json` — 2 keys
5. `src/i18n/locales/fr/events.json` — 2 keys

