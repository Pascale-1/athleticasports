

# Fix: Home Notifications, Redundant CTAs, and Profile Activity View

## Issue 1: Duplicate Notification Bell on Home

**Root cause:** The `NotificationBell` is rendered in two places simultaneously on mobile:
1. Inside `MobileLayout` header (line 31 of `MobileLayout.tsx`) -- always visible on every page
2. Inside the Home page itself (`Index.tsx` line 219) -- a second bell in the "utility header row"

**Fix:** Remove the `NotificationBell` from the Home page's utility row (line 219 in `Index.tsx`). The one in `MobileLayout` is the correct, persistent location. The feedback button and language toggle can remain in that utility row.

---

## Issue 2: Redundant "I'm available" / "Organize" vs. Empty State CTAs

**Current behavior:** The Home page has TWO sets of action buttons that do the same thing:

1. **Quick Actions block (always visible, lines 304-335):**
   - "Find a Game" (opens `FindMatchSheet`)
   - "Create Event" (opens `CreateEventDialog`)
   - "Create a Team" (navigates to `/teams/create`)

2. **Empty state inside Games section (lines 464-489), shown when no games exist:**
   - "Looking to play?" (opens `FindMatchSheet`)
   - "Create Event" (opens `CreateEventDialog`)

When there are no games, the user sees both blocks stacked -- identical actions repeated twice.

**Proposed fix -- merge into a single smart section:**

- **Remove the empty-state CTA buttons** (lines 464-489). When the Games section is empty, show only a simple informational message ("No upcoming games") without duplicate action buttons.
- The **Quick Actions block stays** as the single, always-visible action hub. This is the primary call-to-action area and already covers all actions.
- This keeps the UI clean: one place for actions, one place for content.

---

## Issue 3: Profile Lacks Activity / History View

**Current state:** The Profile page (`Settings.tsx`) shows:
- Avatar, name, bio
- `ProfileStats` with 2 counters: Teams count and Events Attended count (tap to navigate away)
- Tabs: Overview (basic info + quick links), About (edit fields), Settings

**Problem:** No way to see the user's actual activity -- their upcoming events, past matches, or teams they belong to -- directly on the profile.

**Proposed solution -- add an "Activity" tab to ProfileTabs:**

Add a fourth tab called "Activity" (with a `CalendarCheck` or `Activity` icon) that shows three collapsible sections, each pulling real data:

### Section A: "Upcoming Events" (max 3, with "View All" link)
- Uses the existing `useUserEvents` hook with `{ status: 'upcoming' }`
- Shows compact event cards (title, date, sport badge, attendance status pill)
- Empty state: "No upcoming events -- find a game or create one"

### Section B: "My Teams" (all teams, compact list)
- Fetches from `team_members` joined with `teams` where `user_id` matches and `status = 'active'`
- Shows team name, sport badge, avatar
- Tap navigates to `/teams/:id`
- Empty state: "Not a member of any team yet"

### Section C: "Past Events" (max 5, with "View All" link)
- Uses `useUserEvents` with `{ status: 'past' }`
- Shows completed events with date and type badge (match/training/meetup)
- Provides a sense of history and engagement

### Why this approach works:
- Uses **existing hooks** (`useUserEvents`) and **existing database tables** -- no schema changes needed
- Follows the app's established card + section pattern
- Keeps the profile self-contained rather than forcing navigation away
- The `ProfileStats` counters at the top still work as quick glanceable numbers, while the Activity tab provides the full detail

---

## Technical Details

### Files to modify:

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Remove `NotificationBell` import/usage from utility header row (line 219). Remove the empty-state CTA buttons in the Games section (lines 464-489), keep only the informational empty message. |
| `src/components/settings/ProfileTabs.tsx` | Add a 4th "Activity" tab. Update `TabsList` from `grid-cols-3` to `grid-cols-4`. Add `TabsContent` for "activity" with three sections. |
| `src/components/settings/ProfileActivityTab.tsx` | **New file.** Component for the Activity tab content. Uses `useUserEvents` for upcoming/past events and a direct query for user teams. Renders compact cards for each section. |
| `src/i18n/locales/en/common.json` | Add translation keys: `profile.activity`, `profile.upcomingEvents`, `profile.pastEvents`, `profile.myTeams`, `profile.noUpcomingEvents`, `profile.noPastEvents`, `profile.noTeams` |
| `src/i18n/locales/fr/common.json` | Add matching French translation keys |

### No database changes required
All data already exists in `events`, `event_attendance`, `team_members`, and `teams` tables. The existing `useUserEvents` hook and direct queries are sufficient.

