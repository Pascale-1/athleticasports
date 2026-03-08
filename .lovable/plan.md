

## iOS Touch Issue with SportQuickSelector

### Root Cause

The `SportQuickSelector` container has `touchAction: 'pan-x'` and `overflow-x: auto`, creating a horizontally scrollable area. On iOS (WebKit), this causes a conflict: the browser interprets taps on buttons inside a scrollable container as potential scroll gestures, swallowing the `click` event — especially on small touch targets like these pill buttons.

Additionally, the parent `<div>` in `TeamCreate.tsx` (line 103) adds *another* `overflow-x-auto` wrapper, doubling the scroll conflict.

### Fix

1. **`src/components/events/SportQuickSelector.tsx`**
   - Remove `touchAction: 'pan-x'` from the inline style — this restricts touch to horizontal only, which can prevent taps from registering on iOS
   - Add `onTouchEnd` handlers alongside `onClick` on the sport buttons to ensure iOS registers taps reliably
   - Use `touch-action: manipulation` via Tailwind (`touch-manipulation`) instead — this tells the browser "no double-tap zoom, but allow both taps and scrolling"

2. **`src/pages/TeamCreate.tsx`**
   - Remove the redundant `overflow-x-auto` on the parent wrapper div (line 103) — the `SportQuickSelector` already handles its own scrolling. The double overflow nesting causes iOS to mishandle touch events.

### Details

**SportQuickSelector.tsx** — change the container:
```tsx
// Before
<div className={cn("flex flex-nowrap overflow-x-auto gap-1.5 pb-0.5 scrollbar-hide", className)} 
     style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}>

// After  
<div className={cn("flex flex-nowrap overflow-x-auto gap-1.5 pb-0.5 scrollbar-hide touch-manipulation", className)}
     style={{ WebkitOverflowScrolling: 'touch' }}>
```

**TeamCreate.tsx** — remove double overflow:
```tsx
// Before
<div className="-mx-4 sm:-mx-6 px-4 sm:px-6 overflow-x-auto">

// After
<div className="-mx-4 sm:-mx-6 px-4 sm:px-6">
```

These are small CSS/touch-handling fixes — no logic changes needed.

