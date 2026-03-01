

# Move Username Selection Into Onboarding Flow

## Current Flow
Sign up → Onboarding (5 steps: Welcome → Sport → Location → Goals → Completion) → `/choose-username` → Home

## New Flow
Sign up → Onboarding (6 steps: Welcome → **Username** → Sport → Location → Goals → Completion) → Home

The separate `/choose-username` page is eliminated for new users. For existing users who still have a `user_` system username, the `ProtectedRoute` redirect to `/choose-username` remains as a fallback.

## Changes

### 1. Create `UsernameStep` onboarding component
**New file**: `src/components/onboarding/UsernameStep.tsx`

Extract the username input UI from `ChooseUsername.tsx` into a reusable step component matching the onboarding step pattern (motion animations, `onNext`/`onBack` props). It will:
- Show the `@username` input with availability checking (same logic as current page)
- Call `onNext(username)` when confirmed, passing the chosen username up to the parent
- No skip option here -- username is required

### 2. Update `Onboarding.tsx`
- Bump `TOTAL_STEPS` from 5 to 6
- Add `chosenUsername` state
- Insert `UsernameStep` as step 2 (after Welcome, before Sport)
- Shift Sport to step 3, Location to step 4, Goals to step 5, Completion to step 6
- In `handleComplete`, use `chosenUsername` instead of `user_${user.id.substring(0, 8)}`
- After saving, set `sessionStorage` cache key `username_ok_v2_${user.id}` to `'1'` so `ProtectedRoute` skips the username check

### 3. Update progress bar
Adjust `OnboardingProgress` range: hide on steps 1 (Welcome) and 6 (Completion), show for steps 2-5 with `totalSteps = 4`.

### 4. Keep `/choose-username` as fallback
The standalone page remains for existing users whose usernames were reset to `user_*`. No changes needed there.

### Files modified
1. **New**: `src/components/onboarding/UsernameStep.tsx`
2. `src/pages/Onboarding.tsx` -- add username step, bump total, use chosen username on save

