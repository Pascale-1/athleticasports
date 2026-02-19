
# Event Card Redesign: Full Review & Modernization Plan

## What I Can See Right Now (from live screenshots)

The cards currently render like this:

```text
┌─────────────────────────────────────────┐
│ FEB │ Foot foot   [Game] 🌐              │
│  20 │ 10 am · 217 Rue d'Aubervilliers…   │
│     │ 1 going  👥3              ✓ Going  │
└─────────────────────────────────────────┘
```

---

## What Is Not Visually Appealing — 9 Specific Problems

### Problem 1 — The colored top-border accent is too subtle and inconsistent
The card uses `border-t-2 border-t-warning` (amber for Game, blue for Training, green for Meetup). At 2px it is barely visible and carries almost no visual weight. It looks like a rendering artifact rather than a deliberate design choice. Strava, Luma, and FotMob use a **left-side accent bar** (4px) or a **full colored header zone** to communicate event type instantly.

### Problem 2 — The DateBlock is visually isolated and awkwardly proportioned
The `DateBlock` is `w-11 h-14` — a narrow tall rectangle sitting on the left. It shows only month abbreviation + day number, no weekday. This means:
- "FEB 20" tells you nothing about whether it's a Tuesday or a Saturday — critical for sports scheduling
- The block's proportions feel cramped and hard to read at a glance
- The color logic (today=primary, past=muted, future=primary/10) is good but the **size** weakens the signal

### Problem 3 — Title font size is too small (`text-sm`) — the most important element is not the most prominent
The event title uses `text-sm font-semibold`. On a card that fills the full viewport width, the title should be the dominant text element. Competitors like Luma and Eventbrite use `text-base` or `text-lg` for the title. Currently "Foot foot" and "Tina Corner vs Five team" both render at the same visual weight as the location text below.

### Problem 4 — The type badge duplicates the top-border accent color with no added value
Every card has both:
1. A colored top border (`border-t-warning` for Game)
2. A `[Game]` badge in amber

This is **double-signaling** the same information with two different visual treatments. The badge uses `text-[10px]` — extremely small text — and a faint background color, making it nearly invisible in practice. It adds clutter without adding clarity.

### Problem 5 — Globe/Lock icons are meaningless noise at this size
`h-3 w-3` icons for public/private visibility sit inline with the title row at a near-invisible size. Users cannot parse the meaning of these icons at 12px width without already knowing what they mean. At minimum they need a tooltip or label. More importantly: **public/private visibility is metadata that belongs in a secondary info row**, not cluttering the already-busy title line.

### Problem 6 — The time + location row lacks visual hierarchy separation
`10 am · 217 Rue d'Aubervilliers…` uses `text-xs text-muted-foreground` for both time and location with only a `·` dot separator. There is no icon, no visual weight differentiation, and the location gets truncated at 27 characters (hardcoded). On a narrow screen, `217 Rue d'Aubervilliers…` with `…` after 25 chars tells the user almost nothing about where the event actually is.

### Problem 7 — The "X going" count and avatar stack conflict with the RSVP button spatially
The bottom row tries to fit:
- Avatar stack (up to 3 circles)
- "X going" count text
- Optional "Need X" badge
- RSVP dropdown button

All in one `flex justify-between` row. When avatars + count + need badge all appear simultaneously, the RSVP button gets visually crowded and the whole row feels cluttered. The RSVP button at `h-6 px-2 text-[11px]` is too small to be a confident primary action.

### Problem 8 — The RSVP button label "RSVP" is unclear for a sports app
When no status is set, the button shows "RSVP" with no icon — a generic hospitality term. Sports app competitors use: "Join", "I'm in", "Going", or a thumbs-up icon. The label choice combined with the tiny `h-6` button size makes the primary action feel secondary.

### Problem 9 — No visual distinction between past events and upcoming events
Past events render with `bg-muted/50 text-muted-foreground` on the DateBlock only. The rest of the card — title, location, RSVP button — renders identically to upcoming events. There is no "Past" badge, reduced opacity, or other visual treatment to tell the user at a glance that "Basket test" from Feb 19 is already over.

---

## What Should Be Added or Changed — 9 Fixes

### Fix 1 — Replace top-border accent with a left-side 4px accent bar + type icon in DateBlock

**Instead of:** `border-t-2 border-t-warning`
**Use:** `border-l-4 border-l-warning` (left-side bar — the FotMob / Strava pattern)

This gives **4× more visual weight** to the type color and is more recognizable as a navigation/categorization signal. Pair this with adding the event type icon (Dumbbell / Trophy / Users) as a small overlay on the DateBlock.

### Fix 2 — Redesign DateBlock to include the weekday abbreviation

**Instead of:**
```
FEB
 20
```
**Show:**
```
FEB
 20
SAT
```
Add the weekday (`EEE` format, e.g., "SAT") in small text below the day number. This is the single most useful piece of scheduling information (knowing if an event is on a weekend vs. weekday), and every sports calendar app (FotMob, Google Calendar, Apple Calendar) includes it.

### Fix 3 — Increase title to `text-base font-semibold`, remove type badge

The title should dominate the card. Remove the `[Game]` / `[Training]` badge — the left accent bar + DateBlock icon already communicate the type. The freed-up horizontal space allows the title to never need truncation for reasonable event names.

### Fix 4 — Redesign the secondary info row with distinct icons

Replace the plain `10 am · location` text row with icon-prefixed elements:

```
🕐 10:00  📍 Stade Charléty (arrondissement or short name)
```

Use `Clock` icon for time and `MapPin` for location. Keep them as separate elements so they're individually scannable. Limit location to the **venue name only** (before the comma in the address), not the full street address.

### Fix 5 — Move visibility/recurrence to a tertiary "chip" strip below

Create a compact third row (only when relevant data exists) with small pill chips:
- `🌐 Public` or `🔒 Private` (with text label, not just icon)
- `🔁 Recurring` (only if applicable)
- `€ 5` or `Free` (cost chip)

These are **secondary metadata** and should live below the main content, not compete with the title.

### Fix 6 — Make the RSVP button a proper primary action

Replace the `h-6 px-2 text-[11px]` ghost button with:
- `h-8 px-3 text-xs rounded-full` for unset status
- Filled colored pill when status is set (green for Going, yellow for Maybe)
- Label: `"Join"` instead of `"RSVP"` for unset state

This makes the CTA feel deliberate and tappable on mobile.

### Fix 7 — Separate the attendance count from the RSVP area

Move the avatar stack + count to sit immediately below the location row as a standalone element. Give it its own visual treatment:

```
👥 Thomas, Marie + 6 others · 8 going
```

Or in compact form: `[avatar][avatar][avatar] 3 going`

This removes the cramped bottom row and lets the RSVP button stand alone in the bottom-right.

### Fix 8 — Add a "Full" state and a "Past" state to cards

**Full:** When `isFull`, show the RSVP button as a disabled "Full" badge (amber/red) with no dropdown. The current code calculates `isFull` but never renders anything for it.

**Past:** Add `opacity-60` to the entire card content (not the card border) and add a small `Past` chip over the DateBlock. This tells users at a glance that events in their list are historical.

### Fix 9 — Add a sport indicator to the card

The card currently shows event **type** (Training/Game/Social) but not **sport** (Football, Tennis, Padel). For a sports app, the sport is the most discriminating filter. Add a sport emoji or name as a small chip next to the time row:

```
⚽ Football  ·  🕐 10:00  ·  📍 Stade Charléty
```

---

## Target Layout After Redesign

```text
┌──────────────────────────────────────────┐
│▌  FEB  │ Foot foot                  🌐   │  ← left accent bar (amber=game)
│▌   20  │ ⚽ Football · 🕐 10:00          │  ← sport + time on one row
│▌  THU  │ 📍 217 Rue d'Aubervilliers      │  ← full location on its own row
│        │ 👥👤+ 1 going         [ Join ]  │  ← avatars + clear CTA
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│▌  FEB  │ Basket test              🔁 🌐  │  ← recurring + public chips
│▌   19  │ 🏀 Basketball · 🕐 10:00        │
│▌  WED  │ 📍 Place Jean Ferrat, 75011     │
│        │ 👥👤👤👤 +5 · 8 going  [ RSVP ] │
└──────────────────────────────────────────┘
```

---

## Technical Summary

### Files to Change

| File | Changes |
|------|---------|
| `src/components/events/EventCard.tsx` | Full layout redesign: left accent bar, `text-base` title, remove type badge, icon-prefixed info rows, sport chip, better RSVP button, Full/Past states |
| `src/components/ui/date-block.tsx` | Add weekday (`EEE`) as a third row in the compact/sm DateBlock sizes; widen to `w-12` to accommodate |
| `src/components/events/EventsList.tsx` | Pass `attendees` array through to `EventCard` (currently `attendees` prop is always `[]` because `EventCardWithAttendance` never fetches them — add attendee list to the attendance hook response) |

### No changes needed to
- Database schema
- Translation files (all strings are already translated or use existing keys)
- Any Supabase functions

### One bonus addition — sport display
The event object from `@/lib/events` includes a `sport` field. The card currently ignores it entirely. Reading it from the event and showing the emoji from `@/lib/sports.ts` is straightforward and costs zero API calls.
