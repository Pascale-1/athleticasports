

# Event Types Standardization + Profile Overview Redesign

## Part 1: Standardize Event Type Vocabulary

### Problem
The same event type has different names depending on where you look:
- Code keys: `training` / `match` / `meetup`
- English UI: "Workout" / "Match" / "Hangout"
- French UI: "Seance" / "Match" / "Sortie"
- Translation keys use `game` for `match` type in some places, `training` in others
- `EventCard.tsx` hardcodes its own label map instead of using translations
- `eventConfig.ts` has its own `label` field ("Workout", "Hangout", "Match") duplicating translations

### Proposed Standard Vocabulary

| Code Key | English | French | Icon |
|----------|---------|--------|------|
| `training` | Training | Seance | Dumbbell |
| `match` | Game | Match | Trophy |
| `meetup` | Social | Sortie | Users |

**Rationale:**
- **Training** (not "Workout"): broader -- covers practice, drills, runs, gym sessions, not just "working out"
- **Game** (not "Match"): more inclusive -- pickup games, friendly games, competitive matches all fit. Already used in many translation keys (`form.game.*`)
- **Social** (not "Hangout"): slightly more inclusive and professional for a women's sports community. Covers watch parties, dinners, team bonding

### Changes

**1. `src/lib/eventConfig.ts`**
- Remove the `label` field from `EVENT_CONFIG` (labels come from translations, not config)
- Remove `description` field (also from translations)

**2. `src/i18n/locales/en/events.json`**
- Update `types.training`: "Workout" -> "Training"
- Update `types.game`: "Match" -> "Game"
- Update `types.meetup`: "Hangout" -> "Social"
- Update `filters.training`: "Workout" -> "Training"
- Update `filters.meetup`: "Hangout" -> "Social"
- Update `filters.match`: keep "Match" but this filter key maps to type `game`
- Update `create.trainingDesc`: "Run, train, or practice" -> "Practice, run, or work out together"
- Update `create.meetupDesc`: "Social gatherings" -> "Watch parties, dinners, team bonding"
- Update `create.gameDesc`: "Compete vs opponent" -> "Pickup or competitive games"

**3. `src/i18n/locales/fr/events.json`**
- French labels are already good (Seance/Match/Sortie), minor description tweaks only

**4. `src/i18n/locales/en/common.json`**
- Update `home.organizeEventSubtitle`: "Match, training, hangout" -> "Game, training, social"

**5. `src/i18n/locales/fr/common.json`**
- Update `home.organizeEventSubtitle`: "Match, entrainement, sortie" (already fine, verify consistency)

**6. `src/components/events/EventCard.tsx`**
- Remove the hardcoded `TYPE_BADGE_CONFIG` label strings
- Use `t('events:types.training')`, `t('events:types.game')`, `t('events:types.meetup')` instead
- Keep the color classes

**7. `src/pages/EventDetail.tsx` and `src/pages/JoinEvent.tsx`**
- Replace `eventConfig.label` with `t('events:types.{type}')` using the same mapping

**8. `src/components/events/EventTypeSelector.tsx`**
- Already uses translation keys correctly, just verify the mapping is consistent

---

## Part 2: Profile Overview Redesign

### Current State
The Overview tab contains:
- A basic info card (email, sport badge, member since date)
- A "Quick Actions" card with "Find a Game" and "Teams" buttons (redundant with bottom navigation)

### Problems
- Quick Actions are duplicated from the home page and bottom nav -- no value here
- No engagement hooks to keep users coming back
- No profile completion nudge
- No social proof or activity summary
- Stats section (Teams + Events count) is good but could be richer

### Proposed New Overview Tab

**Replace the "Quick Actions" card with three new sections:**

**A. Profile Completion Prompt (conditional)**
- Show a progress bar + checklist when profile is incomplete
- Fields to check: avatar, display name, bio, primary sport
- Calculate completion percentage (each field = 25%)
- Show only when completion < 100%
- "Complete your profile" CTA that navigates to the About tab
- Dismiss-able (store in localStorage)

**B. Next Event Countdown Card**
- Show the user's very next upcoming event prominently
- Display: event title, type icon, relative time ("in 2 hours", "Tomorrow at 6pm"), location
- Tap to navigate to event detail
- If no upcoming event, show a subtle "No upcoming events" with a "Browse events" CTA

**C. Monthly Activity Summary**
- Simple row showing: "X events this month" with a small spark line or just the number
- Compared to last month: "2 more than last month" or similar
- Keeps the user aware of their engagement level

### Files to Change

**1. New component: `src/components/settings/ProfileCompletionCard.tsx`**
- Takes profile object, calculates completion
- Renders progress bar + missing field hints
- "Complete Profile" button switches to About tab

**2. New component: `src/components/settings/NextEventCard.tsx`**
- Uses `useUserEvents({ status: 'upcoming' })` to get the next event
- Renders a compact countdown card
- Falls back to empty state with CTA

**3. `src/components/settings/ProfileTabs.tsx`**
- Remove the Quick Actions card from the Overview tab
- Add ProfileCompletionCard (conditional)
- Add NextEventCard
- Keep the existing info card (email, sport, member since)

**4. `src/i18n/locales/en/common.json` and `fr/common.json`**
- Add translation keys for profile completion prompts, next event card labels

### Visual Layout (Overview Tab)

```text
+----------------------------------+
| Profile Info                     |
| Email: user@email.com            |
| Sport: Football                  |
| Member since: Jan 2025           |
+----------------------------------+

+----------------------------------+  (only if < 100%)
| Complete Your Profile    75%     |
| [=====>-------]                  |
| + Add a bio                      |
| [Go to About ->]                 |
+----------------------------------+

+----------------------------------+
| Next Event                       |
| Game vs City Rivals    Tomorrow  |
| Stade Central, 18:00      ->     |
+----------------------------------+
```

---

## Summary of All Files

| File | Action |
|------|--------|
| `src/lib/eventConfig.ts` | Remove `label` and `description` fields |
| `src/i18n/locales/en/events.json` | Standardize type names |
| `src/i18n/locales/fr/events.json` | Minor description tweaks |
| `src/i18n/locales/en/common.json` | Update subtitle, add profile keys |
| `src/i18n/locales/fr/common.json` | Update subtitle, add profile keys |
| `src/components/events/EventCard.tsx` | Use translations instead of hardcoded labels |
| `src/pages/EventDetail.tsx` | Use translations instead of `eventConfig.label` |
| `src/pages/JoinEvent.tsx` | Use translations instead of `eventConfig.label` |
| `src/components/settings/ProfileCompletionCard.tsx` | New component |
| `src/components/settings/NextEventCard.tsx` | New component |
| `src/components/settings/ProfileTabs.tsx` | Replace Quick Actions with new cards |

