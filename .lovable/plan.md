

# Fix Automatic Announcement CTA Text

## Problem
Automatic event announcements contain the text `_Check the Events tab to RSVP!_` but clicking the announcement card navigates directly to the event detail page. The CTA is misleading — users don't need to go to the Events tab, they just tap the card.

## Changes

### 1. Database trigger — update CTA text
**Migration SQL**: Replace all instances of `_Check the Events tab to RSVP!_` with `_Tap to view details and RSVP_` in the `notify_team_event_created` trigger function. This affects:
- Home team announcement (line 85)
- Opponent team announcement (line 109)

The trigger function needs to be replaced via `CREATE OR REPLACE FUNCTION`.

### 2. AnnouncementCard — add subtle "View Event" link
In `src/components/teams/AnnouncementCard.tsx`, add a small inline "View Event →" link below the content for event-linked announcements, making the clickability more discoverable than just the tiny ExternalLink icon.

### Files

| File | Change |
|------|--------|
| New migration SQL | `CREATE OR REPLACE FUNCTION` to update the CTA text in the trigger |
| `src/components/teams/AnnouncementCard.tsx` | Add compact "View Event" link for event-linked cards |

