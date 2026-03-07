

# Events Section — 14 Fixes

This is a large set of fixes spanning event cards, event detail, calendar view, event creation/editing, and sharing. Here is the implementation plan organized by file.

---

## 1. Show paid/free on EventCard

**File**: `src/components/events/EventCard.tsx`

Add a small `€` or "Free" indicator in ROW 5 (the metadata row with location and participants). If `event.cost` exists and is non-empty, show `💰 {cost}€`. Otherwise no indicator (free by default).

The `EventCardProps` interface already accepts the full `Event` type which includes `cost` and `cost_type`. Add the cost display after the attendee count span.

---

## 2. Calendar view layout fix

**File**: `src/components/events/EventCalendar.tsx`

The `+` button issue is the FAB overlapping calendar content. The calendar view itself needs no `+` button — the FAB from `Events.tsx` handles it. The layout issue is the calendar card taking too much space on mobile. Fix:
- Remove the `lg:grid` layout — use stacked layout on all screens for consistency
- Reduce calendar card padding
- The FAB positioning is handled by `Events.tsx` — no change needed there

---

## 3. Event list vs detail consistency

**File**: `src/pages/EventDetail.tsx`

The detail page header uses different badge styles than the cards. Harmonize by ensuring the type chip in the hero section uses the same color scheme as `TYPE_COLORS` from `EventCard.tsx`. Minor spacing/padding adjustments to match card density.

---

## 4. "Add to calendar" — open native calendar

**File**: `src/components/events/AddToCalendarButton.tsx`

Currently the default action opens Google Calendar web URL. For native platforms (Capacitor), the ICS download is the best approach to open the device calendar. Change the primary action:
- Make "Download .ics" the first/default option (this opens native calendar on both iOS and Android)
- Keep Google Calendar, Outlook, Office 365 as secondary web options
- On native platforms, prioritize the ICS download

---

## 5. "Open in Maps" — native maps app

**File**: `src/lib/mapProviders.ts` + `src/pages/EventDetail.tsx`

The map providers use web URLs which open in the in-app browser via `openExternalUrl`. For native platforms, use platform-specific URL schemes:
- iOS: `maps://` or `http://maps.apple.com/?q=...` (Apple Maps opens natively)
- Android: `geo:0,0?q=...` intent URL
- Add a `getNativeMapUrl` function that returns the platform-appropriate URL
- Update EventDetail to use native map URL on native platforms, falling back to web URLs

---

## 6. Share event link broken

**File**: `src/components/events/EventInviteLink.tsx`

The invite link uses `getAppBaseUrl()` which resolves to `https://athleticasports.app`. The route is `/events/join/{inviteCode}`. Verify the `JoinEvent` page handles this route. The link generation looks correct. The issue may be that `navigator.share` fails silently or the clipboard fallback doesn't work in iframe context. Fix:
- Ensure `handleNativeShare` properly falls back
- Add error toast when share fails
- Double-check the route exists in `App.tsx`

---

## 7. Edit event form not scrollable

**File**: `src/components/events/EditEventDialog.tsx`

The dialog already has `max-h-[85vh] overflow-y-auto`. The issue is likely that on mobile, the dialog content is constrained. Fix:
- Change `max-h-[85vh]` to `max-h-[90dvh]` (use dynamic viewport height for mobile browsers)
- Ensure the form itself doesn't have `overflow-hidden` anywhere
- Add `pb-6` at the bottom of the form for scroll breathing room

---

## 8. RSVP bar hidden behind sections

**File**: `src/pages/EventDetail.tsx`

The RSVP bar is `fixed bottom-16` but the page content needs enough bottom padding to not be hidden behind it. Currently `pb-48` on the PageContainer. The issue is specifically on mobile where the bottom nav + RSVP bar stack. Fix:
- Increase `pb-48` to `pb-56` to ensure the last content section (attendees, etc.) is fully visible above the RSVP bar

---

## 9. RSVP deadline & looking-for-players visibility

**File**: `src/pages/EventDetail.tsx`

Currently these are shown as separate cards between the hero and "When & Where". They can be missed. Move them into the "When & Where" card as inline rows (same pattern as date, location, cost) so they're always visible in context. The `RSVPDeadlineDisplay` and `LookingForPlayersBanner` would become compact inline elements within the card.

---

## 10. Scrolling blocked until tap

**File**: `src/pages/EventDetail.tsx` / `src/components/mobile/PageContainer.tsx`

This is likely caused by the `framer-motion` initial animation on the `motion.div` container intercepting touch events during the animation. Fix by adding `style={{ touchAction: 'pan-y' }}` to the motion.div wrapper, ensuring scroll is never blocked.

---

## 11. Sport filter multi-select

**File**: `src/pages/Events.tsx`

Currently sport filter is single-select via a Popover. Change to multi-select:
- Track `activeSports` as `string[]` instead of `string`
- Show selected sports as comma-separated in the chip label
- Filter events where `event.sport` is in the selected array
- Update `useEventFilters` to accept `sports: string[]`

---

## 12. Remove duplicate + button

**File**: `src/pages/Events.tsx`

There's a `PageHeader` with a `+ Create` button (line 239) AND a `FAB` at the bottom (line 602). On mobile, both are visible. Fix:
- Hide the PageHeader's `+` button on mobile (`hidden md:flex`)
- Keep the FAB for mobile only (already has `md:hidden`)

This removes the duplicate and keeps one visible per viewport.

---

## 13. Clarify team selection is optional for games

**File**: `src/components/events/UnifiedEventForm.tsx`

In step 1 (Details), the team selector shows "Pickup or Team" placeholder for matches. Make it clearer:
- Add a small helper text below the team selector: "Optional — skip to create a public pickup game"
- Style as `text-[10px] text-muted-foreground`

---

## 14. Add final result for match events

**Database**: New column `match_result` (text, nullable) on `events` table.

**File**: `src/pages/EventDetail.tsx` — In the "Match Details" card, add a "Result" section visible for past match events. If `canEdit`, show an editable input to enter the score (e.g. "3 - 1"). Display it prominently with a trophy icon.

**File**: `src/components/events/EditEventDialog.tsx` — Add a "Match Result" field (only for match type events).

**Migration SQL**:
```sql
ALTER TABLE public.events ADD COLUMN match_result text;
```

---

## Summary of files to change

| File | Changes |
|------|---------|
| `src/components/events/EventCard.tsx` | Add paid/free indicator |
| `src/components/events/EventCalendar.tsx` | Fix layout |
| `src/components/events/AddToCalendarButton.tsx` | Prioritize ICS download |
| `src/components/events/EditEventDialog.tsx` | Fix scroll, add match result field |
| `src/components/events/EventInviteLink.tsx` | Fix share fallback |
| `src/components/events/UnifiedEventForm.tsx` | Add "optional" hint for team |
| `src/lib/mapProviders.ts` | Add native map URL schemes |
| `src/pages/EventDetail.tsx` | Multiple: bottom padding, inline deadline/LFP, touch-action, match result display |
| `src/pages/Events.tsx` | Multi-select sport, remove duplicate button |
| New migration | Add `match_result` column |

