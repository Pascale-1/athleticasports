

# Fix Profile Layout Overflow + Add Password Reset Flow

## Issue 1: Profile Page -- Tab Labels Overflow

The `ProfileTabs` component uses a 4-column tab grid (`grid-cols-4`) with text labels that are hidden on small screens via `hidden xs:inline`. However, the `xs` breakpoint may not exist in the Tailwind config, causing labels to always show and overflow their boxes on narrow screens (especially in French where "Parametres" and "Activite" are longer).

### Fix
- Change tab label visibility from `hidden xs:inline` to `hidden sm:inline` (standard Tailwind breakpoint) so labels are icon-only on mobile.
- Add `text-xs` to tab triggers for consistent sizing with the design system.
- Add `overflow-hidden` and `truncate` to tab label spans as a safety net.

### Files
- `src/components/settings/ProfileTabs.tsx` (lines 87-102): Update all 4 `TabsTrigger` elements.

---

## Issue 2: No "Forgot Password" or "Change Password" Feature

There is currently **no password reset flow at all** -- no "Forgot Password" link on the Auth page, no reset email trigger, and no page to handle the password reset callback. Users who forget their password are completely locked out.

### Changes

#### A. Auth Page -- Add "Forgot Password" link
- Add a `handleForgotPassword` function that calls `supabase.auth.resetPasswordForEmail()` using the email entered in the form.
- Add a clickable "Forgot password?" link below the password field.
- Add i18n keys for both EN and FR.

**File:** `src/pages/Auth.tsx`

#### B. New page: Reset Password (`src/pages/ResetPassword.tsx`)
- This page handles the callback after the user clicks the reset link in their email.
- Detects the auth recovery event via `onAuthStateChange`.
- Shows a form with "New password" and "Confirm password" fields.
- Calls `supabase.auth.updateUser({ password })` to set the new password.
- Redirects to home on success.

**File:** `src/pages/ResetPassword.tsx` (new)

#### C. Add route
- Add `/reset-password` route in `src/App.tsx`.

**File:** `src/App.tsx`

#### D. Settings Page -- Add "Change Password" option
- In the Settings tab of `ProfileTabs`, add a "Change Password" section that lets authenticated users request a password reset email to their current email.
- This sends a reset link via `supabase.auth.resetPasswordForEmail()`.

**File:** `src/components/settings/ProfileTabs.tsx`

#### E. i18n keys
Add keys to both `en/auth.json`, `fr/auth.json`, `en/common.json`, and `fr/common.json`:
- `forgotPassword`: "Forgot password?"
- `forgotPasswordSuccess`: "Reset email sent"
- `forgotPasswordSuccessDesc`: "Check your inbox for the reset link."
- `resetPassword`: "Reset Password"
- `newPassword` / `confirmPassword` / `passwordMismatch`
- `passwordResetSuccess` / `changePassword` / `changePasswordDesc`

---

## Summary of all files changed

| File | Change |
|------|--------|
| `src/components/settings/ProfileTabs.tsx` | Fix tab overflow; add Change Password section in Settings tab |
| `src/pages/Auth.tsx` | Add forgot password handler + link |
| `src/pages/ResetPassword.tsx` | New page for password reset callback |
| `src/App.tsx` | Add `/reset-password` route |
| `src/i18n/locales/en/auth.json` | Add forgot/reset password keys |
| `src/i18n/locales/fr/auth.json` | Add forgot/reset password keys (FR) |
| `src/i18n/locales/en/common.json` | Add change password keys |
| `src/i18n/locales/fr/common.json` | Add change password keys (FR) |

