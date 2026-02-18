
# Fix Address Autocomplete in the Event Creation Form

## Root Cause — Found

The `AddressAutocomplete` component itself was fixed (the `overflow-hidden` was removed from its container). However, the **`DistrictSelector`** component — which wraps `AddressAutocomplete` and is the one actually used in `UnifiedEventForm` — still has `overflow-hidden` on its wrapper div:

```
// src/components/location/DistrictSelector.tsx — line 35
<div className="space-y-2 min-w-0 overflow-hidden">   ← THIS clips the dropdown
```

This outer `overflow-hidden` clips the absolutely-positioned suggestions dropdown before it can be shown, making suggestions invisible/unclickable in the event creation form. The `EditEventDialog` uses `AddressAutocomplete` directly (no `DistrictSelector` wrapper), which is why those earlier fixes helped there.

## The Fix — One Line Change

**File: `src/components/location/DistrictSelector.tsx`, line 35**

Remove `overflow-hidden` from the wrapper div. Keep `min-w-0` (it prevents flex overflow, unrelated to the dropdown clipping).

```
Before: <div className="space-y-2 min-w-0 overflow-hidden">
After:  <div className="space-y-2 min-w-0">
```

That is the only change needed.

## Why This Is The Real Fix

The suggestion dropdown in `AddressAutocomplete` is rendered as `position: absolute` inside the component's container div. For the dropdown to be visible and clickable, no ancestor in the DOM can have `overflow: hidden`. The chain was:

```text
UnifiedEventForm
  └── FormSection (bg-muted/30 card) — no overflow
       └── DistrictSelector
            └── div.overflow-hidden  ← CLIPS the dropdown  ✗
                 └── AddressAutocomplete
                      └── div (relative, no overflow-hidden now) ← was fixed
                           └── suggestions dropdown (absolute)  ← gets clipped by DistrictSelector
```

After the fix:
```text
UnifiedEventForm
  └── FormSection
       └── DistrictSelector
            └── div (no overflow-hidden) ← ALLOWS dropdown to show  ✓
                 └── AddressAutocomplete
                      └── suggestions dropdown  ← visible and clickable ✓
```

## Files Changed

| File | Change |
|------|--------|
| `src/components/location/DistrictSelector.tsx` | Remove `overflow-hidden` from wrapper div on line 35 |

No other changes needed. No database changes. No translation changes.
