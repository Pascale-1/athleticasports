

## Fix: Step Counter Overlapped by Dialog Close Button

### Problem
The `StepHeader` component in `UnifiedEventForm.tsx` renders the step counter (e.g., "1 / 4") in the top-right corner with `px-4 pt-4`. The `DialogContent` component automatically renders a close button (X) in the same top-right area, causing the two elements to overlap.

### Fix
Add right padding to the `StepHeader`'s top row to leave room for the dialog close button. The close button is typically `24px` wide with some padding, so adding `pr-8` (2rem) to the header's top-level div will prevent the overlap.

### Change
**`src/components/events/UnifiedEventForm.tsx`** (line 125)
- Change `<div className="px-4 pt-4 pb-3 space-y-2.5">` to `<div className="px-4 pr-10 pt-4 pb-3 space-y-2.5">` to give extra right padding for the close button.

### Files Changed
- `src/components/events/UnifiedEventForm.tsx` — one line change in the `StepHeader` component

