

## Fix Calendar View Layout

### Problem
The EventCalendar component's calendar widget is not properly centered and the overall layout feels outdated — the `Calendar` component renders left-aligned within its card, and the design lacks visual polish.

### Changes

**1. `src/components/events/EventCalendar.tsx`** — Improve layout and centering
- Wrap the calendar card content with `flex flex-col items-center` to properly center the calendar widget
- Add slightly more padding and a cleaner visual structure
- Center the legend indicator below the calendar
- Improve the selected date header section with centered text and better spacing
- Add a subtle empty state with an icon instead of plain text

**2. `src/components/ui/calendar.tsx`** — Ensure calendar cells are centered
- The calendar grid cells (`head_cell`, `cell`) use fixed `w-9` widths. Add `justify-center` to `head_row` and `row` classes so the grid is centered within any parent container.

### Specific changes

**`EventCalendar.tsx`:**
```tsx
<Card className="p-4">
  <div className="flex flex-col items-center">
    <Calendar ... className="pointer-events-auto" />
    <div className="mt-3 pt-3 border-t w-full">
      <div className="flex items-center justify-center gap-2 ...">
        ...
      </div>
    </div>
  </div>
</Card>
```

**`calendar.tsx`:**
- Change `head_row: "flex"` → `head_row: "flex justify-center"`
- Change `row: "flex w-full mt-2"` → `row: "flex w-full mt-2 justify-center"`

This ensures the day grid is always centered regardless of container width, fixing the left-tilt issue.

