

# Make Sport & Category Mandatory + Revise Meetup Categories

## Changes

### 1. Validate sport selection for training/match (`src/components/events/UnifiedEventForm.tsx`)
- In `validateCurrentStep`, case 1 (Details step): check `selectedSport` is non-empty when `showSportSelector` is true. If empty, show a toast or inline error preventing advancement.
- Also validate in the legacy forms (`TrainingEventForm.tsx`, `MatchEventForm.tsx`) — MatchEventForm already has `required` on SportQuickSelector; TrainingEventForm does not.

### 2. Validate category selection for meetup (`src/components/events/UnifiedEventForm.tsx`)
- In `validateCurrentStep`, case 1: check `selectedCategory` is non-empty when `showCategorySelector` is true.
- In `MeetupEventForm.tsx`, the zod schema already has `category: z.string().min(1)` so it's already validated there.

### 3. Replace "fitness" and "activity" categories with better options
Current categories feel generic. Replace with more relevant options for a sports-social app:

| Old | New | Emoji | EN | FR |
|-----|-----|-------|----|----|
| `fitness` | `team_building` | 🤝 | Team Building | Team Building |
| `activity` | `outing` | 🏕️ | Outing | Sortie loisirs |

Update in 4 places:
- `MEETUP_CATEGORIES` in `UnifiedEventForm.tsx` (line 50-58)
- `CATEGORIES` in `MeetupEventForm.tsx` (line 42-49)
- `en/events.json` categories section
- `fr/events.json` categories section

### 4. Add validation error translations
- Add `"form.meetup.categoryRequired"` and `"form.sportRequired"` keys to both locale files for inline error messages.

### Files modified
1. `src/components/events/UnifiedEventForm.tsx` — step 1 validation + update category list
2. `src/components/events/MeetupEventForm.tsx` — update category list
3. `src/components/events/TrainingEventForm.tsx` — no change needed (sport is optional there by design, but we should add validation if sport is truly required)
4. `src/i18n/locales/en/events.json` — update category labels + add validation keys
5. `src/i18n/locales/fr/events.json` — update category labels + add validation keys

