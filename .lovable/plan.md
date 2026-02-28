

# Fix 6 Critical Issues

## 1. Language mixing on home screen
**File: `src/pages/Index.tsx`**
- Line 216: Hardcoded `"Bonjour"` → use `t('home.greeting', { name: ... })` 
- Line 233: `home.nextMatch` has French `defaultValue` → remove defaultValue, add proper key
- Line 467: `home.noUpcomingGamesDesc` has French `defaultValue` → remove defaultValue, add proper key

**File: `src/i18n/locales/en/common.json`** — add keys:
- `home.greeting`: `"Hello {{name}} 👋"`
- `home.nextEvent`: `"NEXT EVENT"`
- `home.noUpcomingGamesDesc`: `"Find a game or create your own"`

**File: `src/i18n/locales/fr/common.json`** — add keys:
- `home.greeting`: `"Bonjour {{name}} 👋"`
- `home.nextEvent`: `"PROCHAIN ÉVÉNEMENT"`
- `home.noUpcomingGamesDesc`: `"Trouve un match ou crée le tien"`

## 2. Raw system ID as username
**File: `src/pages/Settings.tsx`** — line 267
- Change `@{profile.username}` → use helper: if username matches `user_[hex]` pattern, display `@` + first name + last initial derived from `display_name` or `full_name`, else display `@{username}`

**File: `src/components/settings/ProfileCompletionCard.tsx`**
- Add `username` field to `COMPLETION_FIELDS` with key `profileCompletion.setUsername`

**Files: `en/common.json` + `fr/common.json`**
- Add `profileCompletion.setUsername`: EN `"Set a username"` / FR `"Définir un nom d'utilisateur"`

## 3. Broken "ago:" label string
**File: `src/components/settings/ProfileTabs.tsx`** — line 132
- Change `{t('time.ago')}:` + `{formatMonthYear(...)}` → use `t('profile.memberSince', { date: formatMonthYear(...) })`

**Files: `en/common.json` + `fr/common.json`**
- Add `profile.memberSince`: EN `"Member since {{date}}"` / FR `"Membre depuis {{date}}"`

## 4. Light mode — Option A (disable toggle, force dark)
**File: `src/components/settings/ProfileTabs.tsx`**
- Remove the ThemeToggle import and the theme label + `<ThemeToggle />` block from the settings tab
- Add comment in the file: `// Light mode token system to be implemented in next sprint`

**File: `src/App.tsx`** — line 225
- Change `defaultTheme="dark"` and add `forcedTheme="dark"` to `<ThemeProvider>`, or simply remove `enableSystem`
- Actually: set `forcedTheme="dark"` to prevent any theme switching

## 5. Placeholder content cleanup
This is database content, not code. The strings "Test", "XXX", "xttt" are user-entered data in the database, not hardcoded in the app. No code changes needed — this requires manual data cleanup in the database. Will note this.

## 6. Log out placement
**File: `src/pages/Settings.tsx`** — line 231
- Remove `rightAction={<LogoutButton variant="header" />}` from `<PageHeader>`

**File: `src/components/settings/ProfileTabs.tsx`**
- Add `LogoutButton` import
- Add a logout row at the bottom of the settings tab, styled as a standard list item in `text-[#64748B]` (not red)

**File: `src/components/settings/LogoutButton.tsx`**
- Add a third variant `"settings"` that renders as a non-destructive styled row item

## Files Modified
1. `src/i18n/locales/en/common.json` — add 5 keys
2. `src/i18n/locales/fr/common.json` — add 5 keys  
3. `src/pages/Index.tsx` — fix 3 hardcoded/defaultValue strings
4. `src/pages/Settings.tsx` — remove logout from header
5. `src/components/settings/ProfileTabs.tsx` — fix "ago:" string, remove ThemeToggle, add logout to settings tab
6. `src/components/settings/LogoutButton.tsx` — add "settings" variant
7. `src/components/settings/ProfileCompletionCard.tsx` — add username to checklist
8. `src/App.tsx` — force dark theme

Note on issue 5: Placeholder content like "Test", "XXX", "xttt" is user-entered data stored in the database. Cleaning it requires database updates, not code changes. Will flag this separately.

