

# Remaining Bug Fixes

Three issues from the original list are still unresolved.

---

## 1. Google Sign-In redirects to Lovable instead of the app

The Auth page still uses `supabase.auth.signInWithOAuth()` which redirects through the hosted auth page, landing on Lovable's domain instead of the deployed app.

**Fix:**
- Use the Configure Social Login tool to generate the `src/integrations/lovable/` module
- Update `Auth.tsx` line 205 to use `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })` instead of `supabase.auth.signInWithOAuth()`
- Remove the `redirectUrl` variable and related invitation URL logic (handle invitation via sessionStorage, which is already in place)

**File:** `src/pages/Auth.tsx`

---

## 2. Onboarding completes but repeats (race condition)

After `handleComplete()` upserts the profile and calls `navigate("/")`, the ProtectedRoute re-checks `onboarding_completed` from the database. The upsert may not have propagated yet, so the user gets sent back to `/onboarding`.

The ProtectedRoute caching fix is already in place, but the Onboarding page itself still navigates immediately after the upsert without any delay.

**Fix:** Add a 500ms delay after the successful upsert before navigating, giving the database time to propagate:

```typescript
if (error) throw error;

// Wait for database propagation before navigating
await new Promise(resolve => setTimeout(resolve, 500));

setTrigger();
navigate("/", { replace: true });
```

**File:** `src/pages/Onboarding.tsx`

---

## 3. Auth page -- all strings hardcoded in English

The Auth page has complete translation files (`en/auth.json` and `fr/auth.json`) but doesn't use them. French-speaking users see a fully English login page.

**Fix:** Add `useTranslation('auth')` and replace all hardcoded strings:

| Hardcoded string | Translation key |
|---|---|
| "Welcome to Athletica" | `t('welcome')` |
| "Sign in or create your account" | `t('signInOrCreate')` |
| "Team Invitation" | `t('teamInvitation')` |
| invitation description | `t('teamInvitationDesc')` |
| "Continue with Google" / "Signing in..." | `t('continueWithGoogle')` / `t('signingIn')` |
| "Or continue with email" | `t('orContinueWith')` |
| "Email", "Password" | `t('email')`, `t('password')` |
| placeholders | `t('emailPlaceholder')`, `t('passwordPlaceholder')` |
| "Sign In" / "Sign Up" | `t('signIn')` / `t('signUp')` |
| toggle text | `t('alreadyHaveAccount')` / `t('dontHaveAccount')` |
| invitation tip | `t('useInvitedEmail')` |
| All toast messages | corresponding auth keys |
| Zod validation messages | `t('invalidEmail')`, `t('passwordMin')` |

**File:** `src/pages/Auth.tsx`

---

## Technical Summary

| File | Changes |
|---|---|
| `src/pages/Auth.tsx` | Switch Google OAuth to `lovable.auth.signInWithOAuth()`, add `useTranslation('auth')`, replace all hardcoded strings with `t()` calls |
| `src/pages/Onboarding.tsx` | Add 500ms delay after upsert before navigating |

Additionally, the Configure Social Login tool needs to be called first to generate the `src/integrations/lovable/` module for managed Google OAuth.

