

# Redesign "Who's Coming" Section — Compact & Scalable

## Problem
The current layout has redundant information (status counts shown twice — once as text, once as avatar row summary), the detailed attendee list takes excessive vertical space with large rows, and the avatar stack preview duplicates the summary line.

## Changes — `src/components/events/EventAttendees.tsx`

### 1. Merge summary into a single compact row
Remove the duplicate: currently there's a status-count row (lines 168-185) AND an avatar-stack row with the same counts (lines 187-208). Merge into one row: avatar stack on the left, compact pill counts on the right.

### 2. Compact attendee rows
- Reduce `AttendeeRow` padding from `py-2 gap-3` to `py-1 gap-2`
- Reduce avatar from `h-6 w-6` to `h-5 w-5`
- Use `text-xs` instead of `text-sm` for names in the expanded list

### 3. Scrollable expanded list
When expanded with many attendees, cap the detail list at `max-h-48 overflow-y-auto` so it doesn't push everything down.

### 4. Always collapse by default
Remove `autoExpand` logic (currently auto-expands for ≤5). Always start collapsed — show just the compact summary row with a "See all" toggle. This keeps the card consistently small.

### 5. StatusSection compactness
- Reduce section header from `text-sm` to `text-xs`
- Reduce indent from `pl-7` to `pl-6`
- Reduce vertical spacing from `space-y-3` to `space-y-2`

## File changes

| File | Change |
|------|--------|
| `src/components/events/EventAttendees.tsx` | Merge summary rows, compact attendee sizing, add scroll cap, always-collapsed default |

