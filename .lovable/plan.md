

# Fix: Persistent Scroll-Jump to Team Selector

## Root Cause

The form re-renders on every single field interaction due to multiple `form.watch()` calls (lines 164-168). During each re-render:

1. The `useEffect` on line 185 has `form` in its dependency array and calls `form.setValue('title', ...)`, which can trigger additional re-renders.
2. The `useEffect` on line 176 also has `form` in its dependency array and calls `form.setValue('opponentName', '')` for match mode on every render cycle.
3. These cascading re-renders cause the Radix `Select` components (team selector, sport selector) to briefly unmount/remount their internal focus management, which triggers `scrollIntoView` behavior inside the scrollable `DialogContent`.

## Fix (1 file: `UnifiedEventForm.tsx`)

### 1. Remove unnecessary `form.watch()` calls
Lines 164-168 declare `watchedTitle`, `watchedDate`, `watchedStartTime`, `watchedMaxParticipants`, `watchedOpponentName`. Most of these are only used deep in the "More Options" section or in useEffects. Replace them with targeted usage:
- Keep only `watchedDate` and `watchedStartTime` (used in RSVP deadline preview on line 928).
- Remove `watchedTitle`, `watchedMaxParticipants`, `watchedOpponentName` -- they cause full component re-renders on every keystroke but aren't used in JSX.

### 2. Remove `form` from useEffect dependency arrays
- Line 176-182: Change deps from `[selectedSport, eventType, form]` to `[selectedSport, eventType]`. Use a ref or extract `form.setValue` into a stable reference. Since `form` methods are stable in react-hook-form v7, removing it from deps is safe and prevents spurious runs.
- Line 185-195: Change deps from `[selectedTeamName, opponentTeamName, homeAway, opponentInputMode, eventType, form]` to remove `form`. Same reasoning.

### 3. Prevent Select scroll behavior
Add `onCloseAutoFocus={(e) => e.preventDefault()}` to `SelectContent` inside `MyTeamSelector.tsx` and `SportQuickSelector.tsx`. This prevents Radix Select from calling `scrollIntoView` on its trigger when the dropdown closes.

These are small, surgical edits. No logic, visual, or data changes -- just fixing the re-render cascade and focus management that causes the scroll jump.

