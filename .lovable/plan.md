

# Fix All Text Truncation and Visibility Issues App-Wide

## Problem

Multiple components across the app use `truncate`, `line-clamp-1`, or `overflow-hidden` classes that cut off text and make content unreadable. The worst offender is the `SelectTrigger` component which applies `[&>span]:line-clamp-1` globally, clipping selected values in every dropdown.

## All Identified Issues and Fixes

### 1. SelectTrigger Component (`src/components/ui/select.tsx`, line 20)

**Issue**: `[&>span]:line-clamp-1` on the trigger clips selected values like "Partie ouverte (sans equipe)" or team names.

**Fix**: Remove `[&>span]:line-clamp-1` and replace with `[&>span]:truncate` which still prevents overflow but shows text on one line with an ellipsis only when truly needed, rather than forcefully clamping.

### 2. Bottom Navigation (`src/components/mobile/BottomNavigation.tsx`, line 134)

**Issue**: `truncate max-w-[72px]` on nav labels can clip words like "Equipes" or "Evenements".

**Fix**: Remove `truncate` and increase `max-w-[72px]` to `max-w-[80px]` -- nav labels are short (4-8 chars) and should never need truncation.

### 3. Event Card Location Slicing (`src/components/events/EventCard.tsx`, lines 103-107)

**Issue**: Location is hard-sliced to 16 characters with `...` appended, e.g. "Stade de France" becomes "Stade de Franc..." -- not user-friendly.

**Fix**: Increase slice to 25 characters (most mobile cards can fit this) and let CSS `truncate` handle overflow naturally.

### 4. Page Header Title (`src/components/mobile/PageHeader.tsx`, line 63)

**Issue**: `truncate` on the page title `h1` can clip page names.

**Fix**: Replace `truncate` with `line-clamp-2` so longer titles wrap to a second line rather than being cut off.

### 5. Team Card Description (`src/components/teams/TeamCard.tsx`, line 71)

**Issue**: `truncate` on team description only shows one line and clips mid-word.

**Fix**: Change `truncate` to `line-clamp-2` so descriptions get up to 2 lines of visibility.

### 6. Settings Profile Name (`src/pages/Settings.tsx`, line 244)

**Issue**: `truncate` on the profile display name can clip long names.

**Fix**: Replace `truncate` with `break-words` and remove single-line constraint.

### 7. Activity Card Username (`src/components/feed/ActivityCard.tsx`, line 93)

**Issue**: `truncate` on display name in feed can clip usernames.

**Fix**: Add `max-w-[60%]` alongside `truncate` to ensure the timestamp always shows, but give the name more room than the current unconstrained truncation.

### 8. Event Form Overflow (`src/components/events/UnifiedEventForm.tsx`, line 331)

**Issue**: `overflow-hidden` on the form container can clip content at the edges.

**Fix**: Change to `overflow-x-hidden` only -- vertical content should never be hidden.

### 9. Swipeable Event Card (`src/components/events/SwipeableEventCard.tsx`, lines 133, 156)

**Issue**: `line-clamp-1` on title and `truncate` with `max-w-[160px]` on location are too aggressive.

**Fix**: Change title to `line-clamp-2` and increase location `max-w` to `max-w-[200px]`.

### 10. Notification Item Title (`src/components/notifications/NotificationItem.tsx`, line 91)

**Issue**: No explicit text wrapping -- relies on parent `min-w-0` but the title could still overflow.

**Fix**: Add `line-clamp-2` to notification title to allow wrapping for longer notifications.

## Summary of Files Modified

| File | Change |
|---|---|
| `src/components/ui/select.tsx` | Replace `[&>span]:line-clamp-1` with `[&>span]:truncate` |
| `src/components/mobile/BottomNavigation.tsx` | Remove `truncate`, widen max-w |
| `src/components/events/EventCard.tsx` | Increase location slice from 16 to 25 chars |
| `src/components/mobile/PageHeader.tsx` | Title: `truncate` to `line-clamp-2` |
| `src/components/teams/TeamCard.tsx` | Description: `truncate` to `line-clamp-2` |
| `src/pages/Settings.tsx` | Profile name: remove `truncate` |
| `src/components/feed/ActivityCard.tsx` | Add `max-w-[60%]` to username |
| `src/components/events/UnifiedEventForm.tsx` | `overflow-hidden` to `overflow-x-hidden` |
| `src/components/events/SwipeableEventCard.tsx` | Title `line-clamp-2`, location `max-w-[200px]` |
| `src/components/notifications/NotificationItem.tsx` | Title: add `line-clamp-2` |

All changes are CSS-only tweaks. No logic or structural changes.

