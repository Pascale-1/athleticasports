

# Fix Auto-Submit Bug + Modernize Event Form

## Root Cause of Auto-Submit

The Enter key in any `<input>` triggers the native HTML form submission. The current `onSubmit` handler calls `goNext()` on non-last steps, which advances to the Options step. But the Enter keypress event can also trigger the newly-rendered submit button on the next frame, causing an immediate double-fire: advance + submit.

**Fix**: Intercept Enter at the `<form>` level via `onKeyDown`, preventing native form submission entirely. Only the explicit submit button click should create the event.

## Changes

### `src/components/events/UnifiedEventForm.tsx`

**1. Prevent Enter-key submission (the real fix)**

Add `onKeyDown` to the `<form>` element that blocks Enter on all inputs (except `<textarea>`):

```tsx
<form
  onSubmit={(e) => {
    e.preventDefault();
    if (isLastStep) {
      form.handleSubmit(handleSubmit)();
    }
    // Remove the else { goNext() } — Enter should NOT auto-advance
  }}
  onKeyDown={(e) => {
    if (e.key === 'Enter' && !(e.target instanceof HTMLTextAreaElement)) {
      e.preventDefault();
    }
  }}
>
```

This completely stops Enter from triggering form submission or step advancement. Users must tap the explicit Next/Submit buttons.

**2. Modernize typography and layout (using existing tokens only)**

- **StepHeader**: Larger step title (`text-base font-bold` → ~16px), thin `h-1` progress bar below filling with `bg-primary`
- **StepCard**: Slightly more padding (`px-5 py-4`), border at `border-border/30`, background `bg-card`
- **FieldRow**: Icon containers slightly larger (`h-9 w-9`), icons at 18px (`h-[18px] w-[18px]`), gap increased to `gap-4`
- **Ghost inputs**: Add `focus:shadow-[0_1px_0_0_hsl(var(--primary))]` for a subtle glow on focus, `transition-all duration-200`
- **Section titles** ("Essentials", "More options"): `tracking-widest uppercase text-[11px] font-semibold text-muted-foreground`
- **CTA button**: `h-[52px] rounded-xl text-sm font-bold shadow-colored` using existing primary color
- **Spacing**: `space-y-1` in StepCard content → `space-y-2` for breathing room

### `src/components/location/AddressAutocomplete.tsx`

No changes needed — the existing `onKeyDown` handler with `e.preventDefault()` on Enter works correctly when suggestions are showing. The form-level `onKeyDown` handler will catch the case when suggestions are NOT showing.

## Summary of visual changes
- Same brand colors throughout (primary, muted, card, border tokens)
- Larger step indicator with progress bar
- More generous spacing and larger touch targets
- Subtle focus glow on inputs using existing primary color
- Bolder CTA button with shadow

