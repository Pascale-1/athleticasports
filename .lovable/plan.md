

# Fix: Catch Up Existing Users on Display Names

## Current State
- The `ProfileCompletionCard` already tracks `display_name` as a completion item and shows on the Overview tab
- The "About" tab has an editable `display_name` field
- **However**, the "Save All" button in edit mode is broken — it only saves the last field (`bio`) because `setEditingField` is called in a sync loop but `onSaveField` only reads the final state

## Problems to Fix

### 1. Save All is broken (bug)
`handleSaveAll` in `ProfileTabs.tsx` calls `setEditingField` in a loop, but React batches state updates, so only the last value sticks. `handleSaveField` in `Settings.tsx` then only saves that one field.

**Fix**: Change `handleSaveField` to accept all temp values directly and save them in a single update call, instead of relying on `editingField` to pick one field at a time.

### 2. Profile Completion Card is dismissible forever
Once dismissed, the card never comes back — even if the user still has no display name. This means the main nudge mechanism is easily bypassed.

**Fix**: Store the dismissed timestamp instead of a boolean. Re-show the card if it was dismissed more than 7 days ago and the profile is still incomplete.

## Changes

| File | Change |
|------|--------|
| `src/pages/Settings.tsx` | Add a new `handleSaveAllFields` function that takes `tempValues` directly and builds the full update object (all 5 fields) in one Supabase `.update()` call. Pass it to `ProfileTabs`. |
| `src/components/settings/ProfileTabs.tsx` | Update `handleSaveAll` to call the new bulk-save function with all `tempValues` instead of looping through `setEditingField`. |
| `src/components/settings/ProfileCompletionCard.tsx` | Change dismiss logic: store a timestamp in localStorage instead of `'true'`. Re-show the card if 7+ days have passed and profile is still incomplete. |

### Implementation Detail

**Settings.tsx** — new function:
```typescript
const handleSaveAllFields = async (values: Record<string, string>) => {
  if (!profile) return;
  const { error } = await supabase.from('profiles').update({
    full_name: values.fullName || null,
    display_name: values.displayName || null,
    primary_sport: values.primarySport || null,
    team_name: values.teamName || null,
    bio: values.bio || null,
  }).eq('user_id', profile.user_id);
  if (error) { toast.error("Failed to update profile"); return; }
  toast.success("Profile updated");
  fetchProfile();
};
```

**ProfileCompletionCard.tsx** — dismiss with timestamp:
```typescript
const [dismissed, setDismissed] = useState(() => {
  const ts = localStorage.getItem('profile-completion-dismissed');
  if (!ts) return false;
  const daysSince = (Date.now() - parseInt(ts)) / 86400000;
  return daysSince < 7; // re-show after 7 days
});

const handleDismiss = () => {
  setDismissed(true);
  localStorage.setItem('profile-completion-dismissed', Date.now().toString());
};
```

No database changes needed.

