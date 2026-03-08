

## Fix Address Field and Time Field Layout Issues

### Problem 1: Address field "décalé" (misaligned)
The country selector (`w-[72px]`) in `AddressAutocomplete.tsx` takes space, pushing the input field. When used inside FieldRow with `ghost` mode (borderless input), the country dropdown creates visual misalignment. The flex container with `gap-2` and the 72px selector eat into the input width.

### Problem 2: Time taking two rows
In `UnifiedEventForm.tsx` (line 748), the time input and `DurationPicker` are in a `flex items-center gap-2` container. On narrow screens the duration picker wraps to a second line.

### Changes

**1. `src/components/location/AddressAutocomplete.tsx`**
- Make the country selector more compact: reduce width from `w-[72px]` to `w-[56px]` or similar
- Reduce gap between selector and input from `gap-2` to `gap-1.5`

**2. `src/components/events/UnifiedEventForm.tsx`**
- On the time + duration row (line 748), add `flex-wrap-nowrap` and ensure the time input and duration picker stay on one line by using `shrink-0` on both elements and making the container `overflow-hidden` or constraining widths

