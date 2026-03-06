

# Plan: Fix Team Section Issues (12 items)

This is a large set of fixes spanning UI, backend, and feature additions. Here's the breakdown:

---

## 1. Remove duplicate + button on Teams page

**Problem:** The Teams page has both a `<Button>` in the `PageHeader` `rightAction` (line 184) AND a `<FAB>` at the bottom (line 374). The FAB is `md:hidden` so on mobile both show; on desktop only the header button shows.

**Fix:** Remove the FAB from `src/pages/Teams.tsx` (lines 373-378). The header button is always visible and sufficient.

---

## 2. Fix horizontal scrolling on sport selection (team creation)

**Problem:** `SportQuickSelector` uses `flex flex-nowrap overflow-x-auto` but is inside a `<form>` / `<CardContent>` that may clip overflow. The component itself should work, but the parent containers may constrain it.

**Fix:** Add `overflow-visible` or adjust the parent `CardContent` in `TeamCreate.tsx` to not clip. Also ensure the `SportQuickSelector` wrapper has proper `-mx` padding to allow edge-to-edge scrolling on mobile.

---

## 3. Fix error creating private team

**Problem:** The `createTeam` function does `.insert().select().single()`. For a private team, the SELECT part runs with RLS that requires `is_team_member()`. The AFTER INSERT trigger `handle_new_team_owner` should have inserted the member by then, but there may be a race condition or the `.select()` in the chained call might not see the trigger's inserts.

**Fix:** Split the create into two steps: first `.insert()` without `.select()`, then separately `.select()` the team by ID. Alternatively, since the trigger is SECURITY DEFINER and runs in the same transaction, the issue might be elsewhere. Add better error logging and handle the case where `.select()` fails by falling back to fetching the team separately.

---

## 4. Smoother team join (remove `window.location.reload()`)

**Problem:** `TeamDetail.tsx` line 129 calls `window.location.reload()` after joining. This causes a full page refresh.

**Fix:** Replace `window.location.reload()` with a React-based state refresh. After joining, refetch the team data and update state so the component re-renders showing the member view. Use the existing `useTeam` hook's refetch mechanism or call `navigate(0)` as a lighter alternative, but ideally just invalidate/refetch the team query.

---

## 5. Fix chat scroll jumping to top on send

**Problem:** `TeamChat.tsx` uses `ScrollArea` with `ref={scrollRef}`. The `useEffect` on `[messages]` scrolls to bottom, but `ScrollArea` from Radix exposes a viewport element, not the root. `scrollRef.current` may point to the wrong element, so `scrollTop = scrollHeight` doesn't work correctly.

**Fix:** Access the actual viewport element inside `ScrollArea`. Radix's `ScrollArea` renders a viewport div. Use a ref on a sentinel element at the bottom and call `scrollIntoView()`, or find the viewport via `scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]')`.

---

## 6. Fix performance level assignment error

**Problem:** The `usePerformanceLevels` hook calls `.upsert()` on `player_performance_levels`. The RLS INSERT policy requires `auth.uid() = assigned_by`, and the upsert includes `assigned_by: user.id`. However, upsert does an INSERT or UPDATE — the UPDATE policy checks `can_manage_team()` or coach role, but the upsert might conflict on a unique constraint. Need to check if there's a unique constraint on `(team_id, user_id)`.

**Fix:** Check if there's a unique constraint. If not, add one via migration: `ALTER TABLE player_performance_levels ADD CONSTRAINT unique_team_user UNIQUE (team_id, user_id);`. Also ensure the upsert specifies `onConflict: 'team_id,user_id'`. The current code doesn't specify `onConflict`, which would cause the upsert to fail.

---

## 7. Add "who can post" and "who can make announcements" settings

**New feature:** Add two new columns to the `teams` table:
- `announcement_permission` (text, default `'admin'`) — who can post announcements: `'admin'`, `'member'`
- `chat_permission` (text, default `'member'`) — who can post in chat: `'admin'`, `'member'`

**Changes:**
- Migration: add columns to `teams` table
- `TeamGeneralSettings.tsx`: add two dropdown selectors for these permissions
- `TeamAnnouncements.tsx` / `TeamDetail.tsx`: check the team's `announcement_permission` to decide if `canPost` is true
- `TeamChat.tsx`: check `chat_permission` similarly
- Update `Team` type in `lib/teams.ts`

---

## 8. Fix email invite flow

**Problem:** The edge function `send-team-invitation` uses `appOrigin` from the client or falls back to a lovableproject.com URL. The `getAppBaseUrl()` returns the preview URL. If there's no `APP_URL` secret set, the invite link might point to the wrong domain.

**Fix:** Ensure the edge function uses the correct URL. Set the `APP_URL` secret to the correct production URL, or ensure `getAppBaseUrl()` returns the right value. Also check that the Resend sender domain `noreply@athleticasports.app` is properly verified. If email sending fails silently, add better error reporting.

---

## 9. Fix error when accepting invitation

**Problem:** The `accept-team-invitation` edge function looks correct. The error might be that the function isn't deployed, or there's an auth issue. The `AcceptInvitation.tsx` page calls `supabase.functions.invoke('accept-team-invitation')`. If the function returns `{ error: ... }` in the response body (status 400), the client treats it as an error but the `supabase.functions.invoke` doesn't throw — it returns `{ data, error }` where `error` is only set for network/CORS issues, while the function's error is in `data.error`.

**Fix:** The current code already handles `data?.error` (line 59-61). The real issue might be that the edge function uses the old ESM import (`https://esm.sh/@supabase/supabase-js@2.80.0`) which needs a `deno.json` import map. Add a `deno.json` for this function similar to `send-team-invitation/deno.json`, then redeploy.

---

## 10. Clicking announcement redirects to related event

**Problem:** Announcements created by the `create_event_announcement` trigger contain event info in their content but have no link to the event. There's no `event_id` column on announcements.

**Fix:** Add `event_id` (nullable UUID) column to `team_announcements`. Update the `create_event_announcement` trigger to set `event_id = NEW.id`. In `AnnouncementCard.tsx`, if `event_id` is set, make the card clickable and navigate to `/events/{event_id}`.

---

## 11. Distinguish training sessions vs matches for users

**Problem:** Events have a `type` field (`training`, `match`, `meetup`) but the UI may not clearly differentiate them.

**Fix:** The `EventCard.tsx` already has `TYPE_COLORS` with distinct colors and emojis per type. Enhance the team's Events section to group or filter by type, and add a visual type indicator (colored dot/chip) that's more prominent. Add filter tabs in `EventsPreview` for "All / Matches / Training".

---

## 12. Add stats/engagement indicators

**New feature:** Add engagement stats to encourage activity:
- On the profile page, add a "streak" counter (consecutive weeks with activity)
- Add an "events this month" counter
- Show a weekly activity summary on the home feed
- Add a "team engagement" score on the team detail page

**Changes:**
- `ProfileStats.tsx`: add a third stat for "streak" or "this month" events
- Create a simple streak calculation based on `event_attendance` data
- Add a motivational message based on activity level

---

## Implementation Order (by priority)

1. **Quick fixes first:** #1 (duplicate button), #2 (scroll), #4 (reload), #5 (chat scroll)
2. **Backend fixes:** #6 (performance levels — migration + code), #3 (private team)
3. **Edge function fixes:** #8 (email invite), #9 (accept invitation) — add deno.json, redeploy
4. **New DB features:** #7 (permissions — migration + UI), #10 (announcement event link — migration + trigger + UI)
5. **UI enhancements:** #11 (event type distinction), #12 (engagement stats)

## Files to Change

| # | Files |
|---|-------|
| 1 | `src/pages/Teams.tsx` |
| 2 | `src/pages/TeamCreate.tsx`, `src/components/events/SportQuickSelector.tsx` |
| 3 | `src/lib/teams.ts` |
| 4 | `src/pages/TeamDetail.tsx` |
| 5 | `src/components/teams/TeamChat.tsx` |
| 6 | Migration + `src/hooks/usePerformanceLevels.ts` |
| 7 | Migration + `src/lib/teams.ts` + `src/components/teams/TeamGeneralSettings.tsx` + `src/pages/TeamDetail.tsx` |
| 8 | `supabase/functions/send-team-invitation/index.ts` + secrets |
| 9 | `supabase/functions/accept-team-invitation/deno.json` (create) + redeploy |
| 10 | Migration + trigger update + `src/components/teams/AnnouncementCard.tsx` |
| 11 | `src/components/teams/EventsPreview.tsx` |
| 12 | `src/components/settings/ProfileStats.tsx` |

