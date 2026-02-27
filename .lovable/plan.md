

# Fix: Address Dropdown Overlap, Validation Bug, and Clearer Options

## Issues Found

### 1. Address autocomplete dropdown clipped
`StepCard` has `overflow-y-auto` which clips the absolutely-positioned address suggestions dropdown. The dropdown renders inside the card but gets cut off by the overflow boundary.

**Fix**: Remove `overflow-y-auto` from `StepCard`. The outer container (`flex-1 overflow-y-auto`) already handles scrolling.

### 2. Event creates without checking options (validation bug)
`validateCurrentStep` switches on `currentStep` (the array index) instead of `currentStepId` (the logical step). When "Details" step is skipped (e.g., meetup), `steps = [0, 2, 3]`:
- `currentStep=1` → `currentStepId=2` (When & Where), but validation case 1 returns `true` (skips date/time/location check)
- `currentStep=2` → `currentStepId=3` (Options), but validation case 2 tries to validate date/time/location (wrong step)

This means users can skip past required fields. **Fix**: Switch on `currentStepId` instead of `currentStep`.

### 3. Clearer Paid/Free and Public/Private toggles
Currently these are subtle switches with small text. Replace with explicit segment-style pill toggles showing both states clearly (e.g., "Free" / "Paid" and "Public" / "Private" with icons).

## Changes

| File | Change |
|------|--------|
| `src/components/events/UnifiedEventForm.tsx` | 1. Remove `overflow-y-auto` from StepCard. 2. Fix `validateCurrentStep` to use `currentStepId`. 3. Restyle visibility toggle as a two-segment pill (Public/Private with icons). 4. Restyle cost toggle as a two-segment pill (Free/Paid with icons). |

