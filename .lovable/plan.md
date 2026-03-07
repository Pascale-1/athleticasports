

## Fix: Move "Create Event" Button to Header (Like Teams Page)

### Problem
The Events page hides the create button on mobile (`hidden md:flex`) and uses a FAB (floating action button) instead. The FAB sits at `bottom-16` which collides with the bottom navigation bar, making it hard to tap.

### Solution
Match the Teams page pattern: show the `+` button in the `PageHeader` on all screen sizes and remove the FAB entirely.

### Changes — `src/pages/Events.tsx`

1. **Remove `hidden md:flex`** from the `rightAction` Button (line 256) so it's visible on mobile too
2. **Remove the FAB** component and its wrapper (lines 632-639)
3. **Remove the `FAB` import** (line 22) since it's no longer used

The result: the create event button appears in the upper-right corner of the page header, consistent with the Teams page layout.

