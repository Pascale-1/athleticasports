

## Remove Country Restriction from Address Autocomplete

**File:** `src/components/location/AddressAutocomplete.tsx`

**Change:** Remove the `countrycodes: "fr"` line from the `URLSearchParams` in the `searchAddress` function (~line 82). All other parameters (`limit: "5"`, `format`, `addressdetails`, `accept-language`) remain unchanged.

This is a single-line removal. The existing `limit: "5"` ensures result count stays bounded, and Nominatim's text relevance ranking ensures quality matches globally.

