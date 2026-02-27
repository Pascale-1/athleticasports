

# Fix: RSVP Bar Overlap + "user_" Display Names in Attendees

## Issue 1: RSVP Bar Overlapping Content

The RSVP bar uses `fixed bottom-16` positioning and the page has `pb-36` (144px). When the RSVP bar includes the cancel button + stats text, its total height exceeds the padding. The bar can be ~150-160px tall.

**Fix in `src/pages/EventDetail.tsx`**: Change `pb-36` to `pb-48` (192px) to give enough clearance for the full RSVP bar height.

## Issue 2: "user_" Usernames in Attendees

The `EventAttendees` component already uses `display_name || username` as fallback. The problem is many users have no `display_name` set, so it falls back to auto-generated usernames like `user_abc123`. Two changes:

**Fix in `src/components/events/EventAttendees.tsx`**:
- When `display_name` is null and `username` starts with `user_`, show a friendlier fallback like "Player" or just the avatar with no name clutter
- Strip the `user_` prefix: if username starts with `user_`, display it as the remaining portion capitalized, or just show "Player"

**Fix in `src/hooks/useEventAttendance.ts`**:
- Already fetches `profiles:user_id (username, display_name, avatar_url)` — no change needed, data is available

### Specific approach for username cleanup
In `EventAttendees.tsx`, update the `displayName` derivation in `AttendeeRow` (line 47):
```
const rawName = attendee.profiles?.display_name || attendee.profiles?.username || 'Player';
const displayName = rawName.startsWith('user_') ? 'Player' : rawName;
```

This replaces cryptic `user_abc123` with "Player" — clean and anonymous-friendly. The avatar initials will show "P" which is fine.

| File | Change |
|------|--------|
| `src/pages/EventDetail.tsx` | Line 256: `pb-36` → `pb-48` |
| `src/components/events/EventAttendees.tsx` | Lines 47, ~130, ~145: sanitize usernames starting with `user_` to show "Player" instead |

