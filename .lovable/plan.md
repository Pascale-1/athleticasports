
# Fix All Remaining Text Truncation Issues App-Wide

## Primary Issue (What You're Seeing)

**"Mes parti..." on the Events page tab bar** -- The tabs "Mes participations", "Organisés", and "Découvrir" use `truncate max-w-[60px]` which aggressively clips French labels. This is the most visible broken text in the app.

## All Files With Remaining Truncation Problems

### 1. Events Page Tabs (`src/pages/Events.tsx`, line 245)

**Current**: `<span className="truncate hidden xs:inline max-w-[60px]">`
**Problem**: "Mes participations" (18 chars) gets clipped to "Mes parti..."
**Fix**: Remove `truncate` and `max-w-[60px]`. Also shorten the French label in `fr/events.json` from "Mes participations" to "Participations" (fits better in a tab). Remove `hidden xs:inline` so labels always show.

### 2. Events Page Type Filter Labels (`src/pages/Events.tsx`, lines 304, 363)

**Current**: `<span className="hidden xs:inline">{t(labelKey)}</span>`
**Problem**: On screens below `xs` breakpoint, filter labels like "Seance", "Match", "Sortie" are completely hidden, leaving only icons with no context.
**Fix**: Remove `hidden xs:inline` so labels always show (they are short enough: 5-7 chars).

### 3. Index Page Welcome (`src/pages/Index.tsx`, line 237)

**Current**: `<h1 className="text-section font-heading font-bold truncate">`
**Problem**: Long names like "Welcome back, Jean-Baptiste!" get cut off.
**Fix**: Replace `truncate` with `line-clamp-2` so the greeting wraps instead of clipping.

### 4. Index Page Event Titles (`src/pages/Index.tsx`, line 434)

**Current**: `<p className="font-medium text-sm truncate">{match.title}</p>`
**Problem**: Event titles in the upcoming events list get clipped.
**Fix**: Change `truncate` to `line-clamp-2`.

### 5. Event Preview Card Title (`src/components/events/EventPreviewCard.tsx`, line 58)

**Current**: `<p className="font-semibold truncate">`
**Problem**: Long event titles in the creation preview get cut off.
**Fix**: Change `truncate` to `line-clamp-2`.

### 6. Event Preview Card Location (`src/components/events/EventPreviewCard.tsx`, line 78)

**Current**: `<span className="truncate">{location}</span>`
**Fix**: This is fine since it's within a flex row with an icon -- truncate is appropriate here.

### 7. AvailableGameCard Location (`src/components/matching/AvailableGameCard.tsx`, lines 124, 170)

**Current**: `<span className="truncate">{getLocationLabel()}</span>`
**Fix**: Already has character slicing to 25 chars -- truncate here is a safety net, acceptable.

### 8. MatchProposalCard Title (`src/components/matching/MatchProposalCard.tsx`, line 82)

**Current**: `<h3 className="font-semibold text-lg truncate">{event.title}</h3>`
**Fix**: Change `truncate` to `line-clamp-2`.

### 9. MatchProposalCard Location (`src/components/matching/MatchProposalCard.tsx`, line 99)

**Current**: `<span className="truncate">{event.location}</span>`
**Fix**: Acceptable -- single-line location in a flex row.

### 10. Announcement Card Username (`src/components/teams/AnnouncementCard.tsx`, line 35)

**Current**: `<p className="font-medium text-sm sm:text-base truncate">@{username}</p>`
**Fix**: Acceptable -- usernames in a flex row with timestamp should truncate gracefully.

### 11. Team Member Card (`src/components/teams/TeamMemberCard.tsx`, lines 49, 51)

**Current**: `truncate` on username and display name.
**Fix**: Acceptable -- names in a card row with badges should truncate.

### 12. Members Preview (`src/components/teams/MembersPreview.tsx`, lines 55, 81)

**Current**: `truncate` on member names.
**Fix**: Acceptable -- compact preview cards.

### 13. Users Page (`src/pages/Users.tsx`, lines 103, 105)

**Current**: `truncate` on username and display name.
**Fix**: Acceptable -- profile cards in a list.

### 14. Team Events Breadcrumb (`src/pages/TeamEvents.tsx`, line 71)

**Current**: `<Link ... className="... truncate">{team?.name}</Link>`
**Fix**: Change `truncate` to `line-clamp-1 break-all` so very long team names don't disappear.

### 15. French Label Too Long (`src/i18n/locales/fr/events.json`, line 19)

**Current**: `"myEvents": "Mes participations"`
**Fix**: Shorten to `"Participations"` -- the tab context already implies "my".

## Summary of Actual Changes

| File | Line | Change |
|---|---|---|
| `src/i18n/locales/fr/events.json` | 19 | "Mes participations" to "Participations" |
| `src/pages/Events.tsx` | 245 | Remove `truncate`, `hidden xs:inline`, `max-w-[60px]` |
| `src/pages/Events.tsx` | 304, 363 | Remove `hidden xs:inline` from type filter labels |
| `src/pages/Index.tsx` | 237 | `truncate` to `line-clamp-2` on welcome title |
| `src/pages/Index.tsx` | 434 | `truncate` to `line-clamp-2` on event title |
| `src/components/events/EventPreviewCard.tsx` | 58 | `truncate` to `line-clamp-2` on title |
| `src/components/matching/MatchProposalCard.tsx` | 82 | `truncate` to `line-clamp-2` on title |
| `src/pages/TeamEvents.tsx` | 71 | `truncate` to `break-words` on breadcrumb |

8 targeted fixes across 6 files. All CSS-only + 1 label shortening. No logic changes.
