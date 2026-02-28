

# Visual Layout Redesign — Cards, Training, Home Hero, Empty States

Design-only changes. No tabs, features, or navigation modified.

## 1. Event/Match Cards — New Visual Hierarchy (`src/components/events/EventCard.tsx`)

Restructure the card layout from the current date-badge + title row to a new 3-tier hierarchy:

**Top**: Status chip as the first visual element — positioned top-left before anything else:
- Ongoing events: `🟢 Live` chip (green bg)
- Past events with scores: `🏁 Final` chip (muted bg)  
- Upcoming: `📅 Mar 5 · 18h00` chip (primary/10 bg)

**Center**: Large bold score or date/time — 2× the metadata text size:
- For matches: event title at `text-[22px] font-bold` (center-dominant)
- For upcoming: date/time formatted large at `text-[22px] font-bold text-primary`

**Bottom**: Small muted metadata line — location, sport emoji, attendee count at `text-[11px] text-muted-foreground`

Remove the 40×40 date badge. Keep RSVP pill row, organizer menu, and visibility indicators. Keep the 3px left accent border.

## 2. Training Cards — Upcoming/Past Visual Separation

### `src/components/teams/TrainingCalendar.tsx`
- Add a sticky segmented toggle at the top: "À venir | Passés"
- Split sessions into upcoming (before now) and past (after now)
- Default to "À venir"

### `src/components/teams/TrainingSessionCard.tsx`
- Accept new `isPast?: boolean` prop
- When `isPast=true`: apply `opacity-50` to the card wrapper and show a `"Terminé"` badge (muted bg, muted text) next to the title
- Upcoming cards remain full contrast

## 3. Home Screen — "Next Match" Hero Card (`src/pages/Index.tsx`)

Insert a visually dominant hero card before the stats grid (after greeting):
- Only renders when `upcomingEvents[0]` exists
- Full-width card with `bg-primary/5 border border-primary/20`
- Large event title at `text-[20px] font-bold`
- Date/time at `text-[16px] font-semibold text-primary`
- Location muted below
- "View →" link to event detail
- If no upcoming events, skip (don't show empty hero)

No structural changes — existing stats grid, quick actions, games section, and feed remain in same order below.

## 4. Empty States — Enhanced Placeholders (`src/components/EmptyState.tsx`)

Update the shared EmptyState component:
- Add emoji illustration above the icon circle (already supported via `emoji` prop but not always used)
- Ensure all empty state usages across the app provide: emoji, descriptive text, and a CTA button
- Audit and update call sites:
  - `Events.tsx` empty states (already have CTAs — add emojis)
  - `Teams.tsx` empty states (already have CTAs — add emojis)
  - `EventsList.tsx` default empty (add emoji)
  - `TrainingCalendar.tsx` empty day (add emoji + consistent styling)
  - `Index.tsx` no-activities empty (already has emoji — verify consistency)
  - `NotificationPanel` empty state (add emoji)

### Files to edit:
1. `src/components/events/EventCard.tsx` — restructure visual hierarchy
2. `src/components/teams/TrainingSessionCard.tsx` — add isPast prop + opacity + Terminé badge
3. `src/components/teams/TrainingCalendar.tsx` — add À venir/Passés segmented toggle
4. `src/pages/Index.tsx` — add Next Match hero card after greeting
5. `src/components/EmptyState.tsx` — minor style refinement
6. `src/pages/Events.tsx` — add emojis to empty state calls
7. `src/pages/Teams.tsx` — add emojis to empty state calls
8. `src/components/events/EventsList.tsx` — add emoji to default empty
9. `src/components/notifications/EmptyNotifications.tsx` — use EmptyState component with emoji

