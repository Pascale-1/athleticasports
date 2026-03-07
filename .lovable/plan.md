

# Matching System Improvements

Four improvements to make the matching engine more effective and drive user growth.

## 1. Fix Edge Function: Match ALL Event Types

**File:** `supabase/functions/match-players/index.ts`

Currently line 159 filters `.eq("type", "match")`, excluding training and meetup events that also have `looking_for_players = true`. Remove this filter so all event types are matched.

## 2. Set Up Periodic Re-Matching (Cron)

Create a cron job using `pg_cron` + `pg_net` to invoke the `match-players` edge function every 30 minutes. This ensures new events created after a player sets availability still get matched, rather than only triggering on availability creation.

**Requires:** Enable `pg_cron` and `pg_net` extensions via migration, then insert the cron schedule via the insert tool.

## 3. Availability Expiry Reminder Notification

**New edge function:** `supabase/functions/availability-expiry-reminder/index.ts`

A scheduled function (daily cron) that:
- Queries `player_availability` where `is_active = true` AND `expires_at` is within the next 24 hours
- Inserts a notification for each user: "Your availability expires tomorrow. Extend it to keep finding matches."
- Adds a `reminder_sent` column to `player_availability` to avoid duplicate reminders

**Database migration:** Add `reminder_sent boolean DEFAULT false` to `player_availability`.

## 4. Surface "Express Interest" to Organizers

Currently, match proposals with `interest_level = 'maybe'` are stored but never shown to event organizers.

**File:** `src/pages/EventDetail.tsx`

Add a section visible to the event creator showing interested players from `match_proposals` where `interest_level` is `'maybe'` or `'interested'`. Display player name, match score badge, and an "Invite" button that auto-adds them as attending.

**File:** `src/hooks/useMatchProposals.ts` — Add a query for organizer-facing proposals (proposals where the user created the event).

## Summary of Changes

| Change | Files |
|--------|-------|
| Remove `type = match` filter | `supabase/functions/match-players/index.ts` (line 159) |
| Enable pg_cron/pg_net + schedule | DB migration + insert |
| Expiry reminder function | New edge function + cron + migration (`reminder_sent` column) |
| Surface interested players | `src/pages/EventDetail.tsx`, `src/hooks/useMatchProposals.ts` |
| i18n keys | `en/matching.json`, `fr/matching.json` |

No breaking changes. All improvements are additive.

