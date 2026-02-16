

# Fix: Form Scroll Jump — Root Causes Found

## Problem

After all previous fixes, clicking any field (e.g., "1h" duration button) still scrolls the form back to the top (Team selector area). The previous fixes addressed animation and watch calls but missed two critical re-render triggers.

## Root Causes

### 1. `FormSection` component defined INSIDE the render function (line 314)

This is the **primary cause**. Every time the form re-renders (which happens on any state change), React creates a **new component type** for `FormSection`. React treats each new definition as a different component, so it **unmounts and remounts** all children — including the Radix Select components in `MyTeamSelector` and `SportQuickSelector`. When these Select components remount, the browser's focus management triggers `scrollIntoView`, jumping back to the Team selector at the top.

### 2. `form.watch('isPublic')` called in the render body (line 311)

```
const isPublicEvent = isPickupGame || form.watch('isPublic');
```

This causes the entire component to re-render whenever ANY form field changes (watch subscribes to the whole form). Combined with issue #1, every keystroke or button click causes FormSection to remount its children.

## Fix (1 file: `UnifiedEventForm.tsx`)

### Step 1: Move `FormSection` outside the component

Extract `FormSection` to a standalone component defined **outside** `UnifiedEventForm`. This gives it a stable identity across renders so React will update children in place instead of unmounting/remounting them.

### Step 2: Replace `form.watch('isPublic')` with `form.getValues('isPublic')`

Since `isPublicEvent` is only used for display logic (showing a toggle state), using `getValues` reads the current value without subscribing to re-renders. Alternatively, use `useWatch` with a specific field name to limit re-renders to only when `isPublic` changes.

### Summary of changes

- Move `FormSection` component definition from line 314 to above the `UnifiedEventForm` component (around line 88)
- Replace `form.watch('isPublic')` on line 311 with `form.getValues('isPublic')` or `useWatch({ control: form.control, name: 'isPublic' })`

These are two small, surgical edits. No visual, logic, or data changes — just fixing the component identity stability that causes the scroll jump.

