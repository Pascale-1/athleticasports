

## Fix Plan: 3 Issues

### Issue 1: Home page "Games to Join" vs "Upcoming Events"
**Resolution:** Both sections are intentional and show different data. No changes needed per your confirmation.

---

### Issue 2: Chat & Announcements not scrollable in Team Detail

**Root cause:** The `TeamChat` component uses Radix `ScrollArea` with `h-[400px]`, which has known issues with touch scrolling on mobile. The Radix ScrollArea viewport intercepts touch events in a way that conflicts with mobile native scroll.

**Fix — `src/components/teams/TeamChat.tsx`:**
- Replace `<ScrollArea className="h-[400px]">` with a plain `<div>` that uses native overflow scrolling: `className="h-[400px] overflow-y-auto overscroll-contain"`. This works reliably on mobile touch.

**Fix — `src/pages/TeamDetail.tsx`:**
- The announcements tab already has `max-h-[500px] overflow-y-auto` (line 313), but it needs `overscroll-contain` added to prevent scroll chaining (page scrolls instead of the announcements list). Update to `max-h-[500px] overflow-y-auto overscroll-contain`.

---

### Issue 3: Sport horizontal selector not scrollable when creating a team

**Root cause:** The `SportQuickSelector` uses `overflow-x-auto` for horizontal scrolling, but on mobile touch devices this requires explicit `touch-action: pan-x` to prevent vertical page scroll from capturing the horizontal swipe gesture. Also, the parent `PageContainer` applies `overflow-x-hidden` which can clip touch scroll interactions.

**Fix — `src/components/events/SportQuickSelector.tsx`:**
- Add `-webkit-overflow-scrolling: touch` and `touch-action: pan-x` via a style prop on the container div to enable proper horizontal touch scrolling.

**Fix — `src/pages/TeamCreate.tsx`:**
- On the wrapper div (line 103), add `overflow-x-auto` so the horizontal scroll isn't clipped by parent constraints.

