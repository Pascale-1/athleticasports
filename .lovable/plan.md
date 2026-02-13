

# Modernize the Edit Event Dialog

## Problem
The edit dialog is outdated compared to the newly modernized create form:
- Max participants field is always shown as a bare input, even when the event has no participant limit set -- this confuses users into thinking the value wasn't carried over
- Public/private toggle still uses old static wording ("Public Event" / "Visible to all users" regardless of state)
- The overall form layout doesn't match the streamlined create form

## Changes

### `src/components/events/EditEventDialog.tsx` -- Full modernization

1. **Max Participants**: Only show the field if the event already has a `max_participants` value set, or let the user toggle it on (matching the create form's progressive disclosure pattern). Pre-populate with the existing value.

2. **Public/Private Toggle**: Use the same dynamic Switch pattern from the create form:
   - When ON: "Public Event" + "Visible to all users" with Globe icon
   - When OFF: "Private Event" + "Only invited members can see this" with Lock icon

3. **Consistent styling**: Apply the same `bg-muted/30 rounded-xl border` card style for the visibility toggle, matching the create form's look.

4. **Add overflow protection**: Add `min-w-0 overflow-hidden` to the form element to prevent long location values from breaking the dialog layout (same fix applied to the create form).

5. **Import updates**: Add `Globe`, `Lock` from lucide-react and `Switch` is already imported.

### Technical Details

The form state initialization (lines 47-65) already correctly pulls `max_participants` from the event object. The fix is purely about presentation:
- Wrap max participants in a collapsible section that only appears if `event.max_participants` exists or user toggles it
- Replace the static visibility toggle block (lines 230-243) with the dynamic version using Globe/Lock icons and conditional text

No database changes, no translation changes needed (keys `form.isPrivate` and `form.isPrivateDesc` were already added).
