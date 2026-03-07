

## Plan: Comprehensive Per-Page Walkthroughs

### Current State
The walkthrough has 6 steps, all on the Home page. Steps are vague (e.g., "Stay updated with your teams and community activities"). No coverage of Events, Teams, or Profile pages.

### Approach
Replace the single Home-only walkthrough with **page-specific walkthroughs** that trigger on first visit to each section. Each walkthrough highlights the actual UI elements on that page with clear, actionable explanations.

### Walkthrough Content

**Home (5 steps)**
1. **Next Event Card** — "Your next upcoming event appears here. Tap it to see details, RSVP, or check who's coming."
2. **Stats Row** — "Your key numbers at a glance. Tap any stat to jump to the relevant section."
3. **Quick Actions** — "Find a game nearby, create your own event, or browse teams to join — all from here."
4. **Games to Join** — "Games looking for players show up here. Join with one tap."
5. **Activity Feed** — "Recent activity from your teams: new events, results, and announcements."

**Events (5 steps)**
1. **Tab Bar (My / Organized / Discover)** — "Switch between events you're attending, events you created, and new events to discover."
2. **Event Type Filters** — "Filter by type: Training, Game, or Social. You can also filter by sport."
3. **Calendar/List Toggle** — "Switch between list and calendar views to plan your week."
4. **Event Card** — "Each card shows the event type, date, location, and how many spots are left. Tap to RSVP."
5. **Create Button (FAB)** — "Tap + to create a new event: training session, game, or social meetup."

**Teams (4 steps)**
1. **My Teams / Discover Tabs** — "See your teams or discover new ones to join."
2. **Pending Invitations** — "Team invitations appear here. Accept or decline with one tap."
3. **Team Card** — "Each card shows the team sport, member count, and next event. Tap to enter."
4. **Create Team** — "Start your own team and invite friends by email or username."

**Profile (4 steps)**
1. **Profile Header** — "Your avatar, username, and founding member badge. Tap the camera icon to change your photo."
2. **Stats Bar** — "Teams, games played, games this month, and wins — all in one row."
3. **Profile Tabs** — "Edit your info, check your activity history, or adjust app settings."
4. **Share Profile** — "Share your profile link with friends so they can find you on Athletica."

### Technical Changes

| File | Change |
|------|--------|
| `src/i18n/locales/en/walkthrough.json` | Rewrite with per-page step groups (home, events, teams, profile) |
| `src/i18n/locales/fr/walkthrough.json` | French translations for all new steps |
| `src/hooks/useAppWalkthrough.ts` | Accept a `page` parameter. Track completion per page in localStorage (`walkthrough_home_done`, etc.). Each page has its own `startWalkthrough(page)` method. |
| `src/pages/Index.tsx` | Trigger `startWalkthrough('home')` on first visit. Update `data-walkthrough` attributes to match new step IDs. |
| `src/pages/Events.tsx` | Add `data-walkthrough` attributes to tabs, filters, calendar toggle, event cards, FAB. Trigger `startWalkthrough('events')` on first visit. |
| `src/pages/Teams.tsx` | Add `data-walkthrough` attributes to tabs, invitation cards, team cards, create button. Trigger `startWalkthrough('teams')` on first visit. |
| `src/pages/Settings.tsx` | Add `data-walkthrough` attributes to header, stats, tabs, share button. Trigger `startWalkthrough('profile')` on first visit. |

### How It Works
- After onboarding, user lands on Home → Home walkthrough starts automatically
- First time visiting Events → Events walkthrough starts
- First time visiting Teams → Teams walkthrough starts
- First time visiting Profile → Profile walkthrough starts
- Each page's completion is tracked independently
- "Replay walkthrough" in settings resets all pages

