

# Fix Home Screen Issues

## 1. Stats redirect to filtered event type view

**File**: `src/pages/Index.tsx` (lines 256-278)

The stats already redirect correctly:
- Teams → `/teams?filter=my-teams` (correct)
- Games → `/events?type=match` (correct route, but needs to also set tab=my)
- Events attended → `/events?tab=my` (correct)

**Fix**: Change the "games" stat to navigate to `/events?tab=my&type=match` so it opens the "My Events" tab filtered to match type. Change "events attended" to navigate to `/events?tab=my` (already correct). The Events page already reads `type` from search params — need to verify it applies the type filter on load.

**File**: `src/pages/Events.tsx` — Check if `type` search param is read on mount to set `activeEventType`. Currently only `tab` is read from params. Add reading `type` param to initialize `activeEventType`.

## 2. "Looking for" matched events not shown on Home + notifications

**Notifications**: The `match-players` edge function already inserts notifications (lines 273-294). The issue is likely that `notifications` table has no INSERT RLS policy for service role — checking the schema: indeed, `notifications` table shows "Can't INSERT records from the table" for regular users, but the edge function uses service role key. This should work. Need to verify the edge function is actually being triggered (the `trigger_match_on_event_creation` DB function calls it).

**Display on Home**: Match proposals are fetched via `useMatchProposals` but never displayed on the home screen. The home screen only shows `userEvents` (events with attendance) and `availableGames` (games looking for players). When a user signs up for "looking for", they get match proposals but these aren't surfaced.

**Fix**: Add match proposals section to the Home screen, between "Games to Join" and "Your Upcoming Events". Import and use `useMatchProposals` hook. Show pending proposals with `MatchProposalInlineCard` component.

## 3. "Join a team" redirects to My Teams instead of Discover

**File**: `src/pages/Index.tsx` (line 322)

Currently: `onClick={() => navigate("/teams")}` — this goes to Teams page which defaults to "My Teams" tab.

**Fix**: Change to `navigate("/teams?filter=discover")`. Then in `src/pages/Teams.tsx`, read the `filter=discover` param and set `showAllTeams(true)`.

**File**: `src/pages/Teams.tsx` (line 118-122) — Already reads `filter` param but only handles `my-teams`. Add handling for `filter=discover` to set `showAllTeams(true)`.

## 4. "Load more" button not working

**File**: `src/pages/Index.tsx` (line 511)

The bug: `activities.slice(0, 5)` always caps display at 5 items, so even after `loadMore()` fetches more data and appends to the `activities` array, only the first 5 are ever rendered.

**Fix**: Remove the `.slice(0, 5)` — show all loaded activities. The `useActivityFeed` hook already handles pagination with PAGE_SIZE=10, so initial load shows 10 items and "Load more" appends 10 more.

## Summary of changes

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Fix stats links, remove `.slice(0, 5)`, add match proposals section, fix "Join team" link |
| `src/pages/Events.tsx` | Read `type` search param on mount to set `activeEventType` |
| `src/pages/Teams.tsx` | Handle `filter=discover` param |

