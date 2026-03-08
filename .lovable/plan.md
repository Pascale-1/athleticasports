

## Guide User on Address Format + Validate Before Proceeding

### What changes

1. **`src/components/location/AddressAutocomplete.tsx`**
   - Add `onValidChange?: (isValid: boolean) => void` prop
   - Track validity: `true` when a suggestion is selected, or when typed text passes format check (contains comma, 2+ meaningful parts — e.g. `"12 Rue X, 75001 Paris"`)
   - Set `false` when user clears or types something that doesn't match format
   - Add a subtle helper text below the input: *"e.g. 12 Rue de Rivoli, 75001 Paris"* — always visible as placeholder guidance, showing the expected format that works with map links

2. **`src/components/location/DistrictSelector.tsx`**
   - Forward `onValidChange` prop to `AddressAutocomplete`

3. **`src/components/events/UnifiedEventForm.tsx`**
   - Add `isLocationValid` state, pass to `DistrictSelector`
   - Initialize to `true` when editing an event with a pre-filled location
   - In `validateCurrentStep` case 2: if location field is non-empty but `isLocationValid` is false, show toast error and return false

4. **Translation files** (`en/events.json`, `fr/events.json`)
   - Add `"form.locationInvalid"`: EN *"Enter a full address (e.g. 12 Rue de Rivoli, 75001 Paris) or pick one from suggestions"* / FR equivalent
   - Add `"form.locationHint"`: EN *"Use format: street, city — e.g. 12 Rue de Rivoli, 75001 Paris"* / FR equivalent

### Format validation logic
```typescript
const isAddressFormatValid = (str: string): boolean => {
  if (!str || str.trim().length < 5) return false;
  const parts = str.split(',').map(p => p.trim()).filter(p => p.length >= 2);
  return parts.length >= 2; // at least "street, city"
};
```

This allows both selecting from the list AND typing a properly formatted address manually, while guiding users toward map-compatible formatting.

