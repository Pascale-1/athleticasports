

## Native App Store Update Check

### Approach
Create an edge function that acts as a proxy to check the latest app version on both stores, and a client-side hook that runs on native app launch to compare the installed version against the store version.

### How It Works
1. **Edge function `check-app-version`** — Fetches the latest version from:
   - **iOS**: Apple iTunes Lookup API (`https://itunes.apple.com/lookup?bundleId=com.athletica.sports`)
   - **Android**: Scrapes the Google Play Store page or uses a known endpoint
   - Returns `{ ios: "x.y.z", android: "x.y.z" }`

2. **Client hook `useAppUpdate.ts`** — On native platforms only:
   - Gets the installed app version via `@capacitor/app` (`App.getInfo()`)
   - Calls the edge function to get the latest store version
   - Compares versions; if store version is newer, sets state to show the update prompt
   - Stores a "dismissed until" timestamp in localStorage so users aren't nagged every session

3. **`NativeUpdatePrompt` component** — A banner (similar to the existing PWA `UpdatePrompt`) that:
   - Shows "A new version is available" with an "Update" button
   - "Update" opens the App Store / Play Store link via `@capacitor/browser`
   - Can be dismissed (won't show again for 24h)

4. **Integration** — Mount `<NativeUpdatePrompt />` in `App.tsx` alongside the existing `<UpdatePrompt />` (which handles PWA updates only).

### Changes
| File | Change |
|---|---|
| `supabase/functions/check-app-version/index.ts` | New edge function — fetches latest versions from both stores |
| `supabase/config.toml` | Add `[functions.check-app-version]` with `verify_jwt = false` |
| `src/hooks/useAppUpdate.ts` | New hook — calls edge function on native launch, compares with `App.getInfo()` |
| `src/components/NativeUpdatePrompt.tsx` | New component — update banner with store link |
| `src/App.tsx` | Add `<NativeUpdatePrompt />` |
| `src/i18n/locales/en/common.json` | Add `nativeUpdate.*` keys |
| `src/i18n/locales/fr/common.json` | Add `nativeUpdate.*` keys |

### Notes
- `@capacitor/app` is already installed — provides `App.getInfo()` for the current version
- `@capacitor/browser` is already installed — used to open the store URL
- The edge function avoids CORS issues and keeps store-scraping logic server-side
- Version comparison uses simple semver logic (split by `.`, compare numerically)

