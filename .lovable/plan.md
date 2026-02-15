

# Make Payment Method Options Always Visible in Event Form

## Problem
The payment method options (Free, On-site, Online link, Split) and the payment link field are currently **hidden until you type something in the Cost field**. This makes them hard to discover -- you never see them if you don't first enter a cost amount.

## Solution
Restructure the Cost & Payment section so that:
1. The **payment method chips** (Free, On-site, Online, Split) are always visible, not conditional on cost being filled
2. The **cost text input** only appears when a paid method is selected (On-site, Online, or Split) -- not when "Free" is selected
3. The **payment link input** appears when "Online" is selected (same as now)

This way the user flow becomes: pick a payment method first, then fill in cost details if needed.

## Changes

### `src/components/events/UnifiedEventForm.tsx`
- Restructure the Cost & Payment section (lines 790-833):
  - Show payment method chips (Free, On-site, Online, Split) as a top-level inline row, always visible
  - Default to no selection (empty) so it's optional
  - Show the cost text input only when a non-free method is selected
  - Show the payment link input only when "Online" is selected
- Update `handleSubmit` logic (line 296-298): if payment method is "free", clear the cost field

### No other file changes needed
- The EventCard already shows the cost badge when `event.cost` is set
- The EventDetail page already shows cost + payment method + link
- Translations are already in place

## Visual Layout (Before vs After)

**Before:**
```text
[Euro icon] Cost   [____input____]
(nothing else visible until cost is typed)
```

**After:**
```text
[Euro icon] Payment
[Free] [On-site] [Online] [Split]     <-- always visible
(if On-site/Online/Split selected:)
  Cost [____input____]
(if Online selected:)
  Link [____input____]
```

## Technical Details

Only one file is modified: `src/components/events/UnifiedEventForm.tsx`

The payment method state already defaults to `''` (empty string). The change is purely about reordering the conditional rendering:
- Move payment method chips out of the `cost && cost.trim() !== ''` condition
- Wrap the cost input inside a `paymentMethod && paymentMethod !== 'free'` condition
- Keep the payment link input inside `paymentMethod === 'online'` (unchanged)

The submit handler already sends `cost`, `payment_method`, and `payment_link` correctly -- no changes needed there beyond clearing cost when "free" is selected.

