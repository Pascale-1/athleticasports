

## Match Results & Win/Loss Stats

### Current State
- The `events` table already has a `match_result` column (text, nullable)
- EventDetail page already lets organizers enter a free-text result (e.g. "3 - 1") for past match events
- No structured win/loss/draw tracking exists — the result is just a string
- Profile stats show: teams, events attended, events this month
- Team stats show: upcoming events, members, weekly posts

### Proposal

#### 1. Add structured match outcome column
Add a `match_outcome` enum-like column to `events` to track win/draw/loss from the perspective of the team that created the event. This enables querying wins/losses without parsing free-text scores.

**Database migration:**
```sql
ALTER TABLE public.events ADD COLUMN match_outcome text CHECK (match_outcome IN ('win', 'loss', 'draw'));
```

#### 2. Improve match result entry UX in EventDetail
Replace the plain text input with a structured score entry UI:
- Two score inputs (home team / away team) side by side
- Auto-compute `match_outcome` based on scores and `home_away` field
- Still store the formatted string in `match_result` (e.g. "3 - 1") for display
- Set `match_outcome` accordingly

**File:** `src/pages/EventDetail.tsx` — replace the current free-text input (lines 630-664) with a `MatchResultEntry` component.

**New file:** `src/components/events/MatchResultEntry.tsx`
- Two number inputs for scores
- On submit: saves `match_result` as "X - Y" and `match_outcome` as win/loss/draw
- Shows the result prominently with a colored badge (green=win, red=loss, yellow=draw)

#### 3. Add W/L/D stats to Team Quick Stats
**File:** `src/components/teams/TeamQuickStats.tsx`
- Add a 4th stat card or replace "Posts" with a "Record" card showing W-L-D
- New prop: `record: { wins: number, losses: number, draws: number }`

**File:** `src/pages/TeamDetail.tsx`
- Query events for the team where `type = 'match'` and `match_outcome IS NOT NULL`
- Count wins, losses, draws
- Pass to `TeamQuickStats`

#### 4. Add match record to Profile Stats
**File:** `src/components/settings/ProfileStats.tsx`
- Add a 4th stat: "Wins" (Trophy icon, gold tint)
- Query: count events where user attended, type=match, match_outcome='win', and event belongs to a team the user is on
- Tapping navigates to events tab

#### 5. Engagement encouragement
- Show a **win streak** counter in the profile (consecutive wins) — displayed as a flame badge next to the wins count
- On the team page, show a motivational banner when on a streak: "🔥 3-game win streak!"
- After entering a result, show a celebratory toast for wins ("Great win! 🎉") or an encouraging one for losses ("Keep going! 💪")

### Files to create/modify
| File | Action |
|------|--------|
| Database migration | Add `match_outcome` column |
| `src/components/events/MatchResultEntry.tsx` | New — structured score entry |
| `src/pages/EventDetail.tsx` | Use MatchResultEntry component |
| `src/components/teams/TeamQuickStats.tsx` | Add W-L-D record stat |
| `src/pages/TeamDetail.tsx` | Query & pass win/loss data |
| `src/components/settings/ProfileStats.tsx` | Add wins + win streak stat |
| `src/i18n/locales/en/events.json` | Add result-related translations |
| `src/i18n/locales/fr/events.json` | Add FR translations |
| `src/i18n/locales/en/teams.json` | Add record stat labels |
| `src/i18n/locales/fr/teams.json` | Add FR record labels |
| `src/i18n/locales/en/common.json` | Add wins/streak profile labels |
| `src/i18n/locales/fr/common.json` | Add FR profile labels |

