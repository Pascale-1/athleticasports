
# Fix Public/Private Toggle Visibility + Redesign Event Type Selector

## Problem 1: Public/Private Toggle Hidden
The toggle is currently nested **inside** the "Participant Limit" collapsible section (lines 970-1097 of UnifiedEventForm.tsx). It only appears when you click "Set participant limit". This is why it's invisible for Workout and Hangout events despite `showPublicToggle = true`.

**Fix**: Move the public/private toggle **out** of the participant limit block and place it as a standalone section in the main form flow, right after the location fields. This ensures it's always visible regardless of event type.

## Problem 2: Event Type Selector Hard to Read
The current design uses tiny 8px text for descriptions ("Compete vs opponent", "Contre un adversaire") which is nearly illegible, especially on mobile. The tall 80px buttons with three stacked lines feel cramped.

**Redesign**: Switch to a cleaner horizontal pill/segment design:
- Keep the icon + label (e.g., Trophy + "Match") in a compact, wide pill
- Move the description text below the selector as a single contextual line that changes based on selection
- Increase label font to 12px for readability
- Reduce button height to ~48px since descriptions move out

## File Changes

### `src/components/events/UnifiedEventForm.tsx`
1. **Move the public toggle block** (lines 1052-1094) out of the participant limit section (which ends at line 1097) and place it as a sibling in the main `space-y-4` flow, after the location/time section
2. Update the comment from "Meetup only without team" to "Event Visibility"

### `src/components/events/EventTypeSelector.tsx`
Redesign the component:
- Reduce button height from `h-20` to `h-12`
- Remove the 8px description span from inside buttons
- Add a contextual description line below the selector that shows the description for the currently selected type
- Increase label text from `text-[11px]` to `text-xs` (12px)
- Use `gap-1` instead of `gap-0.5` for better icon-label spacing

### Translation keys (no changes needed)
- EN: "Compete vs opponent" / "Run, train, or practice" / "Social gatherings" -- already clear
- FR: "Contre un adversaire" / "Sport ou entraînement" / "Sorties et social" -- already clear
- The descriptions just need to be displayed at a readable size below the selector instead of crammed inside tiny buttons
