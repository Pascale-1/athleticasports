

# Show "Free" indicator on EventCard

## Change

**File**: `src/components/events/EventCard.tsx` (line 294-298)

Currently the cost line only renders when `event.cost` is non-empty, showing `💰 {cost}€`. When there's no cost, nothing is shown. 

Change the conditional to always show a cost indicator:
- If `event.cost` exists and is non-empty → show `💰 {cost}€` (existing)
- Otherwise → show `Free` in a subtle green/success color

Replace the current ternary (lines 294-298) with:

```tsx
<span className="flex items-center gap-0.5">
  {event.cost && event.cost.trim() !== '' 
    ? <>💰 {event.cost}€</>
    : <span className="text-success">Free</span>
  }
</span>
```

Single file, single change.

