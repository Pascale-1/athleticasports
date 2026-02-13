
# Fix: Long Address Text Causing Horizontal Overflow

## Problem
When a long address is entered or selected in the event creation form, the text in the input field causes the entire screen to expand horizontally. This breaks the layout on mobile.

## Root Cause
The `AddressAutocomplete` component and its parent `DistrictSelector` don't enforce width constraints. The input value (a long address string) stretches the form beyond the dialog/page bounds. The `* { max-width: 100% }` rule in CSS helps generally, but form inputs with long unbroken text can still overflow.

## Fix (3 small changes)

### 1. `src/components/location/AddressAutocomplete.tsx`
- Add `overflow-hidden` and `w-full` to the root container div (line 238)
- This ensures the autocomplete wrapper never exceeds its parent width

Change line 238:
```
<div ref={containerRef} className={cn("relative space-y-2", className)}>
```
to:
```
<div ref={containerRef} className={cn("relative space-y-2 w-full min-w-0 overflow-hidden", className)}>
```

### 2. `src/components/location/DistrictSelector.tsx`
- Add `min-w-0 overflow-hidden` to the outer div (line 34) to prevent the wrapper from growing beyond its flex parent

Change:
```
<div className="space-y-2">
```
to:
```
<div className="space-y-2 min-w-0 overflow-hidden">
```

### 3. `src/components/events/UnifiedEventForm.tsx`
- Add `min-w-0 overflow-hidden` to the form element (line 339) to enforce that no child can push the form wider than its container

Change line 339:
```
<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
```
to:
```
<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 min-w-0 overflow-hidden">
```

## Why This Works
- `min-w-0` on flex/grid children prevents them from growing beyond their parent
- `overflow-hidden` clips any content that tries to extend past the container boundary
- These are the same patterns already used elsewhere in the codebase (e.g., `MobileLayout`, button labels with `truncate`)

## Files Changed
| File | Change |
|------|--------|
| `src/components/location/AddressAutocomplete.tsx` | Add `w-full min-w-0 overflow-hidden` to root div |
| `src/components/location/DistrictSelector.tsx` | Add `min-w-0 overflow-hidden` to outer div |
| `src/components/events/UnifiedEventForm.tsx` | Add `min-w-0 overflow-hidden` to form element |
