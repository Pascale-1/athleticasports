

# Send Password Reset Emails from Your Domain

## Current Situation
- Password reset emails are sent by the built-in auth system from `no-reply@auth.lovable.cloud`
- Your app already uses **Resend** with a verified `athleticasports.app` domain for feedback emails
- We can leverage the same Resend setup to send branded password reset emails

## Solution

Create a custom edge function that generates a secure password reset link and sends a branded email via Resend from `noreply@athleticasports.app`.

### How it works

1. User clicks "Forgot password?" on the login page (or "Change password" in settings)
2. Instead of calling the default auth reset method directly, the app calls a new backend function
3. The backend function generates a secure reset link using admin privileges
4. It sends a beautifully branded email via Resend from `noreply@athleticasports.app`
5. User clicks the link and lands on the `/reset-password` page as before

### Changes

| File | Change |
|------|--------|
| `supabase/functions/send-password-reset/index.ts` | **New** -- Edge function that generates a reset link and sends a branded email via Resend |
| `supabase/config.toml` | Add config for the new function (no JWT required so unauthenticated users can reset) |
| `src/pages/Auth.tsx` | Update `handleForgotPassword` to call the new edge function instead of `supabase.auth.resetPasswordForEmail()` |
| `src/components/settings/ChangePasswordSection.tsx` | Update to call the new edge function |

### Technical Details

**Edge Function (`send-password-reset`):**
- Accepts `{ email, redirectTo }` in the request body
- Uses `supabase.auth.admin.generateLink({ type: 'recovery', email, options: { redirectTo } })` to generate the reset link
- Sends a branded HTML email via Resend with the Athletica Sports look and feel
- Returns success/error response
- Rate-limit friendly: always returns success to avoid email enumeration

**Email Template:**
- Branded with Athletica Sports name and purple accent color (#9361E0)
- Clean, mobile-friendly HTML layout matching the feedback email style
- Clear call-to-action button linking to the reset page
- Includes a note that the link expires after 1 hour

**Frontend Changes:**
- Replace direct `supabase.auth.resetPasswordForEmail()` calls with a fetch to the new edge function
- No change to the user experience -- same buttons, same toast messages

