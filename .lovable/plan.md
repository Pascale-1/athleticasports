
# Remove Google Sign-In from Auth Page

## What Changes

A single file needs to be edited: `src/pages/Auth.tsx`.

### Removals

1. **Import** (line 8): Remove `import { lovable } from "@/integrations/lovable/index";` — no longer used once Google is gone.

2. **State** (line 29): Remove `const [googleLoading, setGoogleLoading] = useState(false);`

3. **`handleGoogleAuth` function** (lines 193–215): Remove the entire function body.

4. **Google button in JSX** (lines 263–291): Remove the full `<Button>` block that renders the Google SVG icon and triggers `handleGoogleAuth`.

5. **"Or continue with email" divider** (lines 294–303): Remove the decorative separator — it only existed to visually separate Google from email. With email as the sole method, it adds noise with no purpose.

6. **OAuth error handling in `useEffect`** (lines 61–75): The block that reads `error` and `error_description` from URL search params was added specifically to surface Google OAuth failures back to users. Since Google sign-in is removed, this block can be cleaned up. The `invitationId` extraction within that block will be kept and moved cleanly.

### What Stays Untouched

- Email + password sign-in and sign-up form
- Forgot password flow
- Team invitation banner
- Auth state listener and redirect logic
- All translation keys (the EN/FR auth JSON files have Google-related keys but unused keys do no harm — no need to touch them)

### Result

The auth screen will show:
- Athletica welcome heading
- Optional team invitation banner (when arriving via invite link)
- Email field
- Password field with "Forgot password?" link
- Sign In / Sign Up button
- Toggle between sign-in and sign-up modes

Clean, focused, email-only authentication.

## Technical Details

- No database changes needed
- No translation file changes needed (unused keys are harmless)
- The `@lovable.dev/cloud-auth-js` package stays installed — removing it from `package.json` would require a dependency rebuild and there is no benefit since it has zero runtime cost when unused
- The `src/integrations/lovable/index.ts` file stays as-is (auto-generated, not to be touched)
