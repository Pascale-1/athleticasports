

## Merge "Games to Join" with Discover Events

Currently the home page shows "Games to Join" (only `looking_for_players` events). We'll broaden this section to also include public discoverable events, creating a unified "Events near you" / "Events to discover" section.

### Approach

Use `useDiscoverEvents` instead of `useAvailableGames` for the home page section, since discover events is a superset (all public upcoming events not created by or RSVP'd to by the user). Events with `looking_for_players` will naturally appear in this list too.

### Changes

**`src/pages/Index.tsx`**:
1. Replace the `useAvailableGames` import/hook with `useDiscoverEvents`
2. Rename `topAvailableGames` to use discover events data (still sliced to 3)
3. Update the section header from "Games to Join" / `matching:gamesToJoin` to a broader label like "Discover Events"
4. Replace `AvailableGameCard` with a simpler event row (same style as "Your Upcoming Events" rows -- emoji, title, date, location) since discover events don't all have match-scoring data
5. Keep the "View All" button linking to `/events?tab=discover`
6. Update the empty state condition at line 476 to account for the new data source

**`src/i18n/locales/en/common.json`** and **`fr/common.json`**:
- Add `home.discoverEvents`: "Discover" (EN) / "Découvrir" (FR)

**No other files changed.** The `useAvailableGames` hook stays intact for use on the Events discover tab. We just stop using it on the home page.

