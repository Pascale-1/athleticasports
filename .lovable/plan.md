
# Add Event Cost & Payment Options

## Overview
Add three payment-related fields to events so organizers can communicate costs and payment methods to participants:
1. **Cost display** -- a free-text field (e.g. "15EUR", "Free", "10EUR/person")
2. **Payment link** -- an optional URL for external payment (Lydia, PayPal, Revolut, venue booking page)
3. **Payment method hint** -- a quick selector for how payment is handled (on-site, online link, split via app)

## Database Changes

Add 3 new nullable columns to the `events` table:

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `cost` | `text` | `null` | Free-text cost (e.g. "15EUR", "Free") |
| `payment_link` | `text` | `null` | URL for external payment/booking |
| `payment_method` | `text` | `null` | One of: `on_site`, `online`, `split`, `free` |

No RLS changes needed -- these columns inherit the existing event policies.

## UI Changes

### 1. Event Creation Form (`UnifiedEventForm.tsx`)
Add a new "Cost & Payment" section in the Options area (after RSVP deadline, before Looking for Players):

- **Cost field**: compact inline row with a Euro icon and free-text input (placeholder: "e.g. 15EUR")
- **Payment method**: appears when cost is entered, 4 chip buttons:
  - Free (no cost)
  - On-site (pay at venue)
  - Online link (shows URL input below)
  - Split (split via Lydia/PayPal)
- **Payment link**: text input for URL, shown only when "Online link" is selected

### 2. Event Card (`EventCard.tsx`)
- Show a small cost badge next to the type badge when cost is set (e.g. "15EUR" in a subtle pill)

### 3. Event Detail Page (`EventDetail.tsx`)
- Display cost info in the "When & Where" card:
  - Cost amount with payment method label
  - Clickable payment link button if provided (opens external URL)

### 4. Edit Event Dialog (`EditEventDialog.tsx`)
- Add cost, payment method, and payment link fields matching the create form

### 5. Data Model Updates
- `src/lib/events.ts`: add `cost`, `payment_link`, `payment_method` to the Event interface
- `src/hooks/useEvents.ts`: add fields to `CreateEventData`

## Translations

### English (`events.json`)
```
"cost": {
  "label": "Cost",
  "placeholder": "e.g. 15EUR",
  "free": "Free",
  "onSite": "Pay on-site",
  "online": "Pay online",
  "split": "Split the cost",
  "paymentLink": "Payment Link",
  "paymentLinkPlaceholder": "https://...",
  "paymentMethod": "Payment Method"
}
```

### French (`events.json`)
```
"cost": {
  "label": "Tarif",
  "placeholder": "ex. 15EUR",
  "free": "Gratuit",
  "onSite": "Sur place",
  "online": "Paiement en ligne",
  "split": "Partager les frais",
  "paymentLink": "Lien de paiement",
  "paymentLinkPlaceholder": "https://...",
  "paymentMethod": "Mode de paiement"
}
```

## Technical Details

### Files to modify
1. **Database migration** -- add 3 columns to `events`
2. `src/lib/events.ts` -- add fields to Event interface
3. `src/hooks/useEvents.ts` -- add fields to CreateEventData
4. `src/components/events/UnifiedEventForm.tsx` -- add cost/payment section
5. `src/components/events/EditEventDialog.tsx` -- add cost/payment fields
6. `src/components/events/EventCard.tsx` -- show cost badge
7. `src/pages/EventDetail.tsx` -- show cost info + payment link
8. `src/i18n/locales/en/events.json` -- add cost translations
9. `src/i18n/locales/fr/events.json` -- add cost translations

### Form behavior
- Cost field is always visible as a compact inline row (like the participants field)
- When cost is entered, payment method chips appear below
- When "Online link" is selected, the payment URL input appears
- If cost is left empty or set to "Free", no cost badge appears on cards
- Payment link opens in external browser (uses existing `useExternalLink` hook)
