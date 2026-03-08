

## Make Country, Team, and Time Selection More Subtle

### 1. Country selector — more discoverable but subtle (`AddressAutocomplete.tsx`)
Currently in ghost mode it's just a bare flag emoji with no visual hint it's tappable. 
- Add a small `ChevronDown` icon (h-2.5 w-2.5) next to the flag to signal interactivity
- Add a subtle `hover:bg-muted rounded-sm px-1 py-0.5` background on hover so it looks clickable
- Keep the Popover approach (no layout shift)

### 2. Team pills — more subtle (`InlineTeamPills.tsx`)
The current pills have visible borders and padding that make the row feel heavy.
- Reduce pill padding from `px-3 py-1.5` to `px-2 py-1`
- Remove borders on unselected pills — use only `bg-muted/50` background instead of `border-border`
- Selected state: keep `bg-primary` but lighter — use `bg-primary/10 text-primary border-primary/30` instead of full solid primary
- Make the `+` create button even smaller: just an icon with `h-5 w-5` circle
- Reduce overall gap from `gap-1.5` to `gap-1`

### 3. Time + Duration row — more subtle (`UnifiedEventForm.tsx` + `DurationPicker.tsx`)
Duration preset pills currently look the same weight as team pills — they compete visually.
- In `DurationPicker.tsx`: reduce preset pill padding from `px-2.5 py-1` to `px-2 py-0.5`, remove borders on unselected (use `text-muted-foreground hover:text-foreground` only), selected uses `bg-muted text-foreground font-medium` instead of full `bg-primary`
- Separator dot `·` between time input and duration presets instead of just gap

### Files to change
1. **`src/components/location/AddressAutocomplete.tsx`** — Add chevron + hover state to ghost-mode flag button
2. **`src/components/events/InlineTeamPills.tsx`** — Lighter pill styling, smaller gaps
3. **`src/components/events/DurationPicker.tsx`** — Subtler preset buttons with no borders

