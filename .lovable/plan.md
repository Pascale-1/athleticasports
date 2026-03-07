

# Move "I Paid" Button to Cost & Payment Row

Currently the "I paid" button sits in its own standalone Card below the attendees list — easy to miss. The most strategic placement is **inline with the cost info** inside the "When & Where" card (lines 467-490), where the user already sees the price. This keeps payment context together.

## Changes — `src/pages/EventDetail.tsx`

**1. Enhance the existing Cost & Payment row (lines 467-490)**

Replace the current cost row with an expanded version that includes:
- Cost amount (existing)
- Payment link button if available (existing)  
- "I paid ✓" button when user is attending + hasn't paid → replaces with a green "✓ Paid" badge once confirmed
- Organizer summary: `3/5 paid` shown as a subtle counter

**2. Remove the standalone "Mark as Paid" card (lines 653-678)**

Delete the separate Card + the `hasPaid` badge below it — all consolidated into the cost row.

### Result

The cost row will look like:

```
💶  5€ per person          [I paid ✓]    ← attending, unpaid
💶  5€ per person    ✓ Paid              ← attending, paid  
💶  5€ per person                        ← not attending (no button)
```

Single file change, moving existing logic ~30 lines up into the cost section.

