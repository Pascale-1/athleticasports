

# Username Selection Screen

## Approach
Create a new standalone page at `/choose-username` that appears once after first login for users without a custom username. Integrate it into `ProtectedRoute` with a third check (after auth + onboarding).

## Changes

### 1. New page: `src/pages/ChooseUsername.tsx`
- Full-screen page with dark background matching the app
- "Skip for now" link top-left that sets the fallback `@FirstnameL` username (derived from display_name) and navigates to `/`
- Headline, subtitle, input field with `@` prefix, availability checker (debounced query to `profiles` table), helper text, confirm button
- Input: pill-shaped, `#111318` bg, `1.5px solid #334155` border, 52px height, `@` prefix in `#64748B`
- Availability: spinner while checking, green checkmark if available, red X if taken
- Validation: 3-20 chars, `[a-zA-Z0-9_]` only
- Confirm button: full-width gold pill, disabled until valid + available
- On confirm: updates `profiles.username` and navigates to `/`
- All strings via i18n

### 2. Update `src/components/ProtectedRoute.tsx`
- After onboarding check passes, add a username check: query `profiles.username` (already fetched for onboarding)
- If `isSystemUsername(username)` is true and `onboarding_completed` is true, redirect to `/choose-username`
- Add a `skipUsernameCheck` prop (used on the `/choose-username` route itself)

### 3. Update `src/App.tsx`
- Add lazy import for `ChooseUsername`
- Add route `/choose-username` wrapped in `ProtectedRoute` with `skipOnboardingCheck` and `skipUsernameCheck`

### 4. Add i18n keys to `src/i18n/locales/en/common.json` and `src/i18n/locales/fr/common.json`
- `usernameSelection.skip` → "Skip for now" / "Passer pour l'instant"
- `usernameSelection.title` → "Choose your username" / "Choisissez votre pseudo"
- `usernameSelection.subtitle` → "This is how other players will find you" / "C'est ainsi que les autres joueurs vous trouveront"
- `usernameSelection.placeholder` → "your_username" / "votre_pseudo"
- `usernameSelection.helper` → "3–20 characters. Letters, numbers, and underscores only." / "3 à 20 caractères. Lettres, chiffres et underscores uniquement."
- `usernameSelection.confirm` → "Confirm username" / "Confirmer le pseudo"
- `usernameSelection.taken` → "Username already taken" / "Ce pseudo est déjà pris"
- `usernameSelection.available` → "Available" / "Disponible"
- `usernameSelection.checking` → "Checking..." / "Vérification..."

### Files modified
1. `src/pages/ChooseUsername.tsx` (new)
2. `src/components/ProtectedRoute.tsx` (add username check + redirect)
3. `src/App.tsx` (add route)
4. `src/i18n/locales/en/common.json` (add keys)
5. `src/i18n/locales/fr/common.json` (add keys)

