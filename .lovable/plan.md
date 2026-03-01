

# Hybrid Filter Layout: Inline Type Chips + Sport Dropdown — IMPLEMENTED ✅

## What was done

1. **`src/hooks/useEventFilters.ts`** — Added `sport` field to `EventFilters`, filtering logic, `setSportFilter` helper
2. **`src/pages/Events.tsx`** — Added `Popover`-based Sport dropdown chip after type chips, applied sport filter to all tabs (My Events, Organized, Discover)
3. **`src/components/events/EventCard.tsx`** — Merged sport label into type chip (e.g. `🎾 Game · Padel`), removed standalone sport emoji from ROW 5
4. **`src/i18n/locales/en/events.json`** — Added `filters.sport`, `filters.allSports`
5. **`src/i18n/locales/fr/events.json`** — Added `filters.sport`, `filters.allSports`
