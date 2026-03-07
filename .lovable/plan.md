

## Plan

### Issue 1: "View All" on Games to Join navigates to wrong tab
**File:** `src/pages/Index.tsx` (line 365)

Currently navigates to `/events?tab=open` — but there is no "open" tab. The Events page has tabs: `my`, `organized`, `discover`. The correct destination is `/events?tab=discover`.

**Fix:** Change `navigate("/events?tab=open")` → `navigate("/events?tab=discover")`

---

### Issue 2: Events tab shows notification badge (unanswered RSVP count)
**File:** `src/components/mobile/BottomNavigation.tsx`

The Events nav item currently shows `unansweredCount` as a badge — the number of team events the user hasn't RSVP'd to. This is confusing and unwanted.

**Fix:** Remove the `todayEvents` / `unansweredCount` badge from the Events tab. Set badge to `0` for Events. Also remove the `unansweredCount` logic from `fetchBadgeCounts` since it's no longer used anywhere.

Specifically:
- Remove the `unansweredCount` calculation block from `fetchBadgeCounts` (lines 37-60)
- Remove the `todayEvents` variable (line 77)
- Change the Events nav item badge from `todayEvents` to `0` (already 0 effectively, just clean up)

