
# Fix Address Autocomplete: Dropdown Gets Clipped by overflow-hidden

## Root Cause (Two Layers)

The suggestions dropdown in `AddressAutocomplete` is `position: absolute` and rendered inside its container `div`. Two `overflow-hidden` ancestors are clipping it:

1. **`AddressAutocomplete` container** (line 238): `className="relative space-y-2 w-full min-w-0 overflow-hidden"` — the `overflow-hidden` here clips the absolutely-positioned dropdown, making it unclickable even though it partially appears.

2. **`EditEventDialog` form** (line 123): `className="space-y-4 min-w-0 overflow-hidden"` — a second layer of clipping on the `<form>` itself.

The session replay confirms this: suggestions visually appear (they bleed through partially) but pointer events on them are blocked by the clipping ancestors.

## Fixes

### Fix 1 — `AddressAutocomplete.tsx` (line 238)
Remove `overflow-hidden` from the container div. The `min-w-0` stays (it prevents flex child overflow which is unrelated). The `overflow-hidden` was added to prevent horizontal scroll bleed on mobile, but since the dropdown is positioned absolutely it must not be clipped.

```
Before: "relative space-y-2 w-full min-w-0 overflow-hidden"
After:  "relative space-y-2 w-full min-w-0"
```

### Fix 2 — `EditEventDialog.tsx` (line 123)
Remove `overflow-hidden` from the `<form>` element. This is also clipping the dropdown. The `min-w-0` stays.

```
Before: "space-y-4 min-w-0 overflow-hidden"
After:  "space-y-4 min-w-0"
```

### Fix 3 — `AddressAutocomplete.tsx` suggestion buttons (line 285)
Switch suggestion buttons from `onClick` to `onMouseDown` + `e.preventDefault()`. This is a defensive fix: in any Dialog/Modal context, Radix UI's focus management can cause the dropdown to close before a `click` event fires, but `mousedown` fires first and is immune to focus traps. This ensures selection always works regardless of which dialog wraps the component.

```tsx
onMouseDown={(e) => {
  e.preventDefault(); // Prevent input blur
  handleSelectSuggestion(suggestion);
}}
```

## Files Changed

| File | Change |
|------|--------|
| `src/components/location/AddressAutocomplete.tsx` | Remove `overflow-hidden` from container; switch suggestion buttons to `onMouseDown` + `e.preventDefault()` |
| `src/components/events/EditEventDialog.tsx` | Remove `overflow-hidden` from the `<form>` |

## Why These Three Together

- Fix 1 removes the primary clip that blocks pointer events on the dropdown
- Fix 2 removes the secondary clip on the dialog form wrapper
- Fix 3 makes selection robust against focus/blur race conditions in any future modal context

No database changes, no new dependencies, no translation changes needed.
