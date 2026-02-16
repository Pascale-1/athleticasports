

# Restructure Event Creation Form + Always-Visible Payment Link

## Problems Found

1. **Payment link is buried** inside "More options" > Cost section. Users have to expand options, pick a payment method, then see the link field. It should be upfront.
2. **Match-specific fields are missing**: Opponent name, Home/Away toggle, and Match Format were accidentally removed from the JSX during the previous "More options" refactor. The visibility conditions exist (lines 319-321) but are never rendered.
3. **Form still feels dense** in some areas (e.g., cost chips take up space with 4 options on one row).

## Changes

### 1. Add Payment Link to Essentials (always visible)

Move a simple URL input field right after the Location section, before "More options". This is a clean single input:
- Label: "Link" with a Link2 icon
- Placeholder: "https://..." (booking, payment, or venue link)
- Always visible regardless of event type
- The existing `paymentLink` state and `payment_link` in the submit data will be reused

### 2. Restore Match-Specific Fields in Essentials

Re-add the missing match fields between Team selector and Title, inside the AnimatePresence block. These only appear when event type is "match":

- **Opponent section**: Toggle between "Select team" and "Enter manually", with either a TeamSelector or a text Input
- **Home/Away toggle**: 3 buttons (Home / Away / Neutral)
- **Match Format**: Simple text input (e.g., "5v5", "11v11")

These are essential for match creation and should NOT be in "More options".

### 3. Simplify Cost Section in "More Options"

Keep the cost method chips and cost amount input in "More options" but remove the payment link input from there (since it moved to essentials). This makes the "More options" section lighter.

## Technical Details

### File: `src/components/events/UnifiedEventForm.tsx`

**Add after Location section (after line 577), before "More options" trigger:**
```
{/* Payment / Booking Link - always visible */}
<div className="space-y-1.5">
  <Label className="text-xs flex items-center gap-1.5">
    <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
    {t('cost.paymentLink')}
  </Label>
  <Input
    value={paymentLink}
    onChange={(e) => setPaymentLink(e.target.value)}
    placeholder={t('cost.paymentLinkPlaceholder')}
    className="h-9 text-xs"
    type="url"
  />
</div>
```

**Add after Category selector (after line 412), inside AnimatePresence - match fields:**
- Opponent section (select or manual input) with showOpponentSection guard
- Home/Away 3-button toggle with showHomeAwayToggle guard
- Match Format input with showMatchFormat guard

**Remove from "More options" Cost section (lines 757-764):**
- Remove the `paymentLink` input that was inside the `paymentMethod === 'online'` conditional (since link is now always visible in essentials)

**Update submit handler (line 298):**
- Change `payment_link` to always use `paymentLink` value instead of only when `paymentMethod === 'online'`

### Files Modified
- `src/components/events/UnifiedEventForm.tsx` (all changes in one file)

## Result

- **Payment link** is always one tap away in the essentials section
- **Match creation** works again with opponent, home/away, and format fields restored
- **"More options"** becomes even lighter with the payment link removed from it
- Essential fields: Type, Sport/Team, [Match details], Category, Title, Date/Time/Duration, Location, Link, then Create button
