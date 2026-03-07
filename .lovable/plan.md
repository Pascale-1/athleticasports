

## Walkthrough Review: Issues Found

After cross-referencing each walkthrough step with the actual UI elements and their `data-walkthrough` targets, here are the mismatches:

### Issues

| Step | Problem |
|------|---------|
| **Profile** | Highlights only the greeting ("Hello [name] 👋") but description mentions "teams, games, and followers." There are **no followers** shown anywhere. The stats grid (Teams/Games/Events) is a separate element below, not highlighted. |
| **Quick Actions** | Description says "create your own team" but the actual button says **"Join a team"** — it navigates to team discovery, not team creation. |
| **Event Types** | Floating popover with no element target. Works but feels disconnected. Content is good. |
| **Games** | Called "Your Games" but the section contains **all upcoming events** (training, social, games), games to join, match proposals, and availability status. Description only mentions "games" and "match proposals." |
| **Feed** | Accurate. No changes needed. |
| **Navigation** | Accurate. Minor improvement possible. |

### Proposed Changes

**1. Profile step** — Expand highlight to include the stats grid, update description to match what's actually shown (teams, games, events — not followers).

**2. Quick Actions step** — Fix description: "Find a Game" (set availability), "Create Event" (game, training, social), and "Join a Team."

**3. Event Types step** — Keep as floating popover (it's not on the home page). Refine wording slightly.

**4. Games step → rename to "Your Events & Games"** — Update title and description to reflect that this section shows upcoming events of all types, games to join, and match proposals.

**5. Navigation step** — Minor wording polish.

### Files to Change

| File | Change |
|------|--------|
| `src/i18n/locales/en/walkthrough.json` | Update all step titles and descriptions to match actual UI |
| `src/i18n/locales/fr/walkthrough.json` | French equivalents |
| `src/pages/Index.tsx` | Move `data-walkthrough="profile"` to wrap both the greeting AND the stats grid |

