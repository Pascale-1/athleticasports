

# Fix: Auto-Submit, Text Overlaps, and Address Clipping

## Root Cause of Auto-Submit

The `onKeyDown` and `onSubmit` fixes are already in place, but the event still auto-creates. The cause is a **mobile tap-through**: when the user taps "Next: Options" (the penultimate step), React re-renders with the `type="submit"` button in the **exact same position**. The touch/click event propagates to the newly rendered submit button on the same frame, triggering immediate submission.

**Evidence**: The session replay shows "Creating..." appearing instantly with no user interaction on the Options step.

## Changes

### `src/components/events/UnifiedEventForm.tsx`

**1. Fix tap-through auto-submit**

Add a `useRef` guard (`justAdvancedRef`) that is set to `true` when `goNext()` fires and cleared after a 400ms timeout. The `onSubmit` handler checks this guard and refuses to submit if it's `true`.

```tsx
const justAdvancedRef = useRef(false);

const goNext = async () => {
  if (currentStep < totalSteps - 1) {
    const isValid = await validateCurrentStep();
    if (!isValid) return;
    justAdvancedRef.current = true;
    setTimeout(() => { justAdvancedRef.current = false; }, 400);
    setDirection(1);
    setCurrentStep(currentStep + 1);
  }
};

// In onSubmit:
onSubmit={(e) => {
  e.preventDefault();
  if (isLastStep && !justAdvancedRef.current) {
    form.handleSubmit(handleSubmit)();
  }
}}
```

**2. Make the submit button `type="button"` instead of `type="submit"`**

As a belt-and-suspenders fix, change the final step's create button from `type="submit"` to `type="button"` with an explicit `onClick` that calls `form.handleSubmit(handleSubmit)()` only when `!justAdvancedRef.current`. This completely eliminates any native form submission path.

```tsx
<Button
  type="button"
  onClick={() => {
    if (!justAdvancedRef.current) {
      form.handleSubmit(handleSubmit)();
    }
  }}
  // ... rest of props
>
```

**3. Fix address input display — ghost input too narrow / clipped**

The ghost input in the location `FieldRow` has no bottom border and `pr-8` which can clip long addresses. Add the same `border-b border-border/40 focus:border-primary` styling as other ghost inputs, and change `pr-8` to `pr-10` to accommodate the clear button without overlapping text.

**4. Fix text overlaps in EventCard**

- Location text on line 243 uses `truncate` — change to `line-clamp-2 break-words` per project text-visibility standard
- Title `<h3>` already wraps correctly (no truncate), confirmed OK

**5. Address input horizontal scroll for long values**

In `AddressAutocomplete`, add `overflow-x-auto` to the ghost input wrapper so long selected addresses can be scrolled horizontally rather than silently clipped.

### `src/components/location/AddressAutocomplete.tsx`

- Ghost input: add `border-b border-border/40 focus:border-primary pb-1 transition-all duration-200` to match other ghost inputs in the form
- Ensure the input container allows horizontal scroll for long addresses: `overflow-x-auto`

### `src/components/events/EventCard.tsx`

- Line 243: Change location `<span className="truncate">` to `<span className="line-clamp-2 break-words">` so full venue names are visible

## Summary

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Auto-submit | Mobile tap-through on same-position button swap | Guard ref + `type="button"` on submit |
| Address clipped | Ghost input has no visible boundary, no horizontal scroll | Add border-b styling + overflow-x-auto |
| Text overlap risk | Location truncated to single line | Use line-clamp-2 per project standard |

