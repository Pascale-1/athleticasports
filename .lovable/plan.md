
## Problem
In the mobile bottom navigation (`BottomNavigation.tsx`), the section labels (Home, Events, Teams, Profile) only display when a nav item is active (lines 155-159). The user wants these labels visible at all times for better UX clarity.

## Solution
Modify `src/components/mobile/BottomNavigation.tsx` to always show the section labels, not just on active items. This improves discoverability and makes the navigation clearer, especially on first use.

### Changes
**File:** `src/components/mobile/BottomNavigation.tsx`

1. **Remove the conditional render** (line 155: `{isActive && (...)}`): Always render the label below the icon
2. **Adjust label styling** to be visible even when inactive:
   - Keep current styling for active state (primary color, bold)
   - Add styling for inactive state: smaller text, muted-foreground color, reduced opacity
3. **Fine-tune spacing**: Ensure the label doesn't overflow; consider reducing font size or using text truncation if needed
4. **Maintain badge visibility**: Keep notification badges visible in both active and inactive states

### Expected Result
- All four nav items (Home, Events, Teams, Profile) will always show their labels
- Active items remain highlighted with bold text and primary color
- Inactive items display in muted color with normal weight for visual hierarchy
- No layout breaks; height remains within the nav bar constraints
