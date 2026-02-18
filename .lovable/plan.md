
# Two Focused Fixes: Remove Duplicate Cost Section + Address Pre-fill in Edit Dialog

## Fix 1 — Remove the Duplicate "Tarif" Section

### Root Cause
The Cost section exists **twice** in `UnifiedEventForm.tsx`:
- **Above** "More options" — a full `FormSection` card with Euro icon and title (lines 710–777), always visible
- **Inside** "More options" — an inline row version (lines 834–903), hidden by default

The previous redesign added the Cost block inside "More options" but forgot to remove the original standalone section. Result: two tarif fields, one always visible.

### Fix
Remove the entire standalone `FormSection` for Cost (lines 710–777). The copy inside "More options" is already there and already correct.

---

## Fix 2 — Address Pre-fill in EditEventDialog

### Root Cause
The `EditEventDialog` uses a plain `<Input>` for location (lines 186–194). It does **not** use `AddressAutocomplete` or `DistrictSelector`. So:
- The existing address is displayed as plain text ✓ (value is set from `event.location`)
- But there's no autocomplete — typing a new address is manual, no suggestions
- More importantly: the user sees a plain text box that looks like it can't be edited in a smart way, which reads as "not pre-filled" when the field is empty (events without a saved location show a blank plain input with no guidance)

### Fix
Replace the plain `<Input>` in `EditEventDialog` for the location field with `AddressAutocomplete`. Since `AddressAutocomplete` accepts a `value` prop and syncs it via `useEffect`, it will correctly pre-fill with `event.location` when the dialog opens.

Also clean up `EditEventDialog` while we're in it:
- Remove the `matchFormat` field from the match-specific section (it was removed from the create form already — the edit form still has it at lines 248–256)
- The `matchFormat` state variable (line 45) and the data assignment (line 100) should also be removed

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/events/UnifiedEventForm.tsx` | Remove the standalone Cost `FormSection` (lines 710–777) that sits between the "Where" section and the "More options" button |
| `src/components/events/EditEventDialog.tsx` | Replace plain `<Input>` for location with `AddressAutocomplete`; import `AddressAutocomplete`; remove the `matchFormat` field from the match section and its state |

---

## Technical Details

- `AddressAutocomplete` already accepts `value: string` and `onChange: (value, coords?) => void` — it's a drop-in replacement for the plain `<Input>` in `EditEventDialog`
- The `location` state in `EditEventDialog` is already initialized from `event.location` in the `useEffect`, so `AddressAutocomplete` will receive the correct pre-filled value automatically
- No schema or database changes needed
- No translation changes needed
