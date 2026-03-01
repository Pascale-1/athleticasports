

# Logout Button Visibility Issue

## Diagnosis

The `LogoutButton` component exists in the code and is rendered inside `ProfileTabs.tsx` at line 315, inside the "Settings" tab (4th tab). The component uses `variant="settings"` which renders a `ghost` Button with `text-[#64748B]` — a subtle gray that can easily be missed, especially on a dark background or when scrolling is needed.

The button sits after `ChangePasswordSection` and before `FeedbackForm`, which means on smaller screens it may require scrolling to reach, and the ghost styling makes it blend into the background.

## Plan

### 1. Make the LogoutButton more visible in the Settings tab (`src/components/settings/ProfileTabs.tsx`)

Wrap the LogoutButton inside a `Card` component (like the other settings items) so it has a clear visual container and stands out. Move it to the very end of the settings tab content (after FeedbackForm), as the last item the user sees.

### 2. Update LogoutButton styling (`src/components/settings/LogoutButton.tsx`)

Change the `settings` variant from `ghost` to `outline` with more visible styling — use `text-destructive` color and a border so it clearly reads as a logout action and cannot be missed.

### Files modified
1. `src/components/settings/ProfileTabs.tsx` — wrap LogoutButton in a Card, move to end of settings tab
2. `src/components/settings/LogoutButton.tsx` — update `settings` variant styling for better visibility

