

# Sign-In Screen UX Improvements

## Changes

### 1. Translation keys (`en/auth.json` + `fr/auth.json`)
Add:
- `"rememberMe"`: EN `"Remember me"` / FR `"Se souvenir de moi"`

### 2. `src/pages/Auth.tsx` — Password toggle + Remember me

**Password visibility toggle:**
- Add `showPassword` state
- Wrap password `<Input>` in a `relative` div
- Change input type to `showPassword ? "text" : "password"`
- Add `pr-10` to input, place an `Eye`/`EyeOff` icon button absolutely positioned right inside the field
- Icon color: `text-[#64748B]` default, `text-[#38BDF8]` when visible

**Remember me checkbox:**
- Add `rememberMe` state, initialized from `localStorage.getItem("athletica_remember") === "true"`
- On mount: if remember is true, read saved email/password from localStorage and prefill via `emailForm.setValue`
- On successful sign-in (not sign-up): if `rememberMe`, save email+password to localStorage; if not, clear them
- Render a tappable label+checkbox row between password field and sign-in button (only when `!isSignUp`)
- Custom styled 18px checkbox with rounded-md, the specified border/bg colors, and smooth transition

**Security note:** Storing password in localStorage is as requested. This is a UX-only change — no auth logic changes.

### Files changed
1. `src/i18n/locales/en/auth.json` — add `rememberMe` key
2. `src/i18n/locales/fr/auth.json` — add `rememberMe` key  
3. `src/pages/Auth.tsx` — add password toggle + remember me checkbox

