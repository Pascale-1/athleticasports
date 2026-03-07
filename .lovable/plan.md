

## Replace "This Month" Stat with Training Count

The "This month" counter is redundant next to the total "Games" count. Replace it with a count of training-type events the user has attended.

### Changes

**`src/components/settings/ProfileStats.tsx`**:
1. Replace the `monthRes` query: instead of filtering `events.type = 'match'` with a date range, filter `events.type = 'training'` for all past events (same pattern as `eventsRes` but for trainings).
2. Rename `eventsThisMonth` state field to `trainings`.
3. Update the stat item: change icon from `Flame` to a training-relevant icon (e.g., `Dumbbell` from lucide-react), update label to `t('profile.trainingsLabel', 'Trainings')`, and point value to `stats.trainings`.
4. Remove the `startOfMonth` import (no longer needed).

**Translation files** (`en/common.json`, `fr/common.json`):
- Add `profile.trainingsLabel`: `"Trainings"` (EN) / `"Entraînements"` (FR)

