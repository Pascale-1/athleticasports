

# Make Logout Button Always Visible on Settings Page

## Problem
The logout button is hidden inside the 4th tab ("Settings") of the ProfileTabs component. Users have to navigate to that specific tab and scroll down to find it.

## Solution
Add a prominent logout button directly on the main Settings page (`src/pages/Settings.tsx`), right before the `AccountDangerZone` section at the bottom. This way it's always visible regardless of which tab is active, without needing to scroll through tab content.

## Changes

### `src/pages/Settings.tsx`
- Add `<LogoutButton variant="settings" />` wrapped in a `Card` between the `ProfileTabs` and `AccountDangerZone` sections (around line 304)
- The import for `LogoutButton` already exists at line 16

No other files need changes. The button inside the Settings tab can remain as a secondary access point.

