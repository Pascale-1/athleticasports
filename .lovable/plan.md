

# Add Step Validation Before "Next"

## Problem
The "Next" button advances steps without checking if mandatory fields on the current step are filled. Users can skip past required fields (title, date, start time, location).

## Required Fields Per Step (from Zod schema)
- **Step 0 (What)**: `title` (min 1 char)
- **Step 1 (Details)**: No required form fields (sport/team are local state, optional)
- **Step 2 (When & Where)**: `date` (required), `startTime` (min 1 char), `location` (min 1 char)
- **Step 3 (Options)**: No required fields — this is the submit step

## Changes

### `src/components/events/UnifiedEventForm.tsx`

1. **Add a `validateCurrentStep` async function** that uses `form.trigger()` to validate only the fields relevant to the current step:
   - Step 0 → `form.trigger('title')`
   - Step 1 → always valid (no required form fields)
   - Step 2 → `form.trigger(['date', 'startTime', 'location'])`
   - Step 3 → not applicable (submit button, not next)

2. **Update `goNext`** to call `validateCurrentStep()` first and only proceed if it returns `true`. This will automatically show `FormMessage` errors on invalid fields.

3. No other files need changes.

