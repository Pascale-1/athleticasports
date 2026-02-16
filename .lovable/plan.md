
# Redesign "Tarif" Field with Total/Per-Person Toggle and Mandatory Cost Before Payment Link

## Current State
- "Tarif" (Cost) is buried inside "More options" as a 2x2 grid of payment method buttons (Gratuit, Sur place, En ligne, Partager)
- When a non-free method is selected, a free-text cost input appears (e.g. "15EUR")
- The payment link field sits separately above "More options" (for training/meetup only)
- Cost is fully optional -- you can add a payment link without specifying a price

## Proposed Redesign

### Move Tarif to Essentials Section
Pull the cost/payment block out of "More options" and place it right after the Location field (before the payment link), visible for all event types.

### New "Tarif" UI Layout

```text
+-----------------------------------------------+
| EUR  Tarif                                      |
|                                                 |
|  [ Amount input, e.g. "15" ]  [Total | /pers.] |
|                                                 |
|  [ ] Gratuit (checkbox-style toggle)            |
|                                                 |
|  --- Payment link (only if amount > 0) ---      |
|  [ https://...                             ]    |
+-----------------------------------------------+
```

**Breakdown:**
1. **Amount input** -- A number input with "EUR" prefix, always visible. Placeholder: "0"
2. **Total / Per person toggle** -- Two small segmented buttons next to the amount: "Total" and "/pers." to indicate whether the price is the total cost or per participant
3. **"Gratuit" checkbox** -- A quick toggle below that clears the amount and disables the input when checked
4. **Payment link** -- Only appears when an amount is entered (> 0). This makes cost mandatory before providing a payment link
5. **Payment method buttons removed** -- The old "Sur place / En ligne / Partager" grid is removed. The payment link presence itself implies online payment; absence implies on-site/cash

### Validation
- If a payment link is provided, cost must be filled (enforced by the UI since the link only shows when cost > 0)
- Cost field accepts numbers only with optional decimals

### Data Model
- `cost` field stores the amount as a string (e.g. "15")
- New field: `cost_type` -- "total" or "per_person" (add to events table and Event interface)
- `payment_method` simplified or removed (no longer needed with the new UI)
- `payment_link` remains as-is

## Technical Changes

### 1. Database Migration
- Add `cost_type` column to `events` table: `TEXT DEFAULT 'total'`, nullable

### 2. `src/lib/events.ts`
- Add `cost_type?: 'total' | 'per_person' | null` to the `Event` interface

### 3. `src/hooks/useEvents.ts`
- Include `cost_type` in the `CreateEventData` type and in the insert/update queries

### 4. `src/components/events/UnifiedEventForm.tsx`
- Remove the 2x2 payment method grid from "More options"
- Move cost section to essentials area (after location, before "More options")
- New state: `costType` ('total' | 'per_person'), default 'total'
- New state: `isFree` (boolean), default false
- Replace `paymentMethod` state with simpler logic
- Amount input: number type, disabled when `isFree` is true
- Segmented toggle for Total / Per person
- Payment link input conditionally rendered only when cost > 0
- Submit handler maps to `cost`, `cost_type`, `payment_link`

### 5. `src/components/events/EditEventDialog.tsx`
- Mirror the same Tarif UI changes for editing events

### 6. i18n updates (both `en` and `fr`)
- Add keys: `cost.total` ("Total" / "Total"), `cost.perPerson` ("Per person" / "/pers."), `cost.amount` ("Amount" / "Montant"), `cost.freeToggle` ("Free event" / "Gratuit")
- Remove unused keys: `cost.onSite`, `cost.online`, `cost.split`

### 7. Event Detail Page (`src/pages/EventDetail.tsx`)
- Display cost with the type indicator: e.g. "15EUR /pers." or "30EUR total"
- Show "Gratuit" when no cost
