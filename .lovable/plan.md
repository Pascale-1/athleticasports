

# Fix: Form Jumping Back to Team Selector on Every Click

## Root Cause

Three factors combine to cause the scroll-jump bug:

1. `AnimatePresence mode="sync"` forces synchronized enter/exit animations across all conditional sections. Any state change re-evaluates all children, causing layout shifts that scroll back to the first animated element (the team selector).
2. `aria-live="polite"` on the parent wrapper tells the browser to announce and potentially scroll to any DOM changes inside it.
3. The `fieldVariants` animate between `height: 0` and `height: 'auto'` with `overflow` toggling, which triggers expensive layout recalculations.

## Fix (1 file)

### `src/components/events/UnifiedEventForm.tsx`

1. **Remove `mode="sync"` from `AnimatePresence`** (line 349) -- use default mode so animations don't force synchronization and layout recalculation across all children.

2. **Remove `aria-live="polite"`** from the parent div (line 347) -- this attribute is causing the browser to scroll/focus to DOM changes inside the container.

3. **Add `layout={false}`** to each `motion.div` to prevent Framer Motion's automatic layout animation from triggering scroll repositioning.

These are 3 small edits in the same file. No logic, data, or visual changes -- just fixing the animation configuration that causes the scroll-jump.

