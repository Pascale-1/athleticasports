

# Fix Password Reset Link (Not Loading)

## Root Cause

The reset link in the email points to the Supabase auth server (`/auth/v1/verify?token=...&redirect_to=...`). After verifying the token, Supabase tries to redirect to your preview URL -- but that URL isn't in the allowed redirect list, so the redirect fails silently. The user ends up on a page that never receives the recovery session.

## Solution

Skip the Supabase redirect entirely. Instead:
1. In the edge function, extract the raw token from the `action_link` and build a direct link to the app (e.g., `https://your-app/reset-password?token_hash=abc123&type=recovery`)
2. On the ResetPassword page, detect the `token_hash` query parameter and call `supabase.auth.verifyOtp()` to establish the session client-side

This approach works with any domain (preview, published, custom) since it never relies on server-side redirects.

## Files to Change

| File | Change |
|------|--------|
| `supabase/functions/send-password-reset/index.ts` | Parse token from `action_link`, build a direct app link instead |
| `src/pages/ResetPassword.tsx` | Detect `token_hash` query param, call `verifyOtp()` to establish session |

## Technical Details

### Edge Function (`send-password-reset/index.ts`)
After getting the `action_link`, parse the `token` parameter from it and build a direct link:

```typescript
const resetLink = data?.properties?.action_link;
// Extract token_hash from the action_link URL
const actionUrl = new URL(resetLink);
const tokenHash = actionUrl.searchParams.get("token");
// Build direct app link
const appResetLink = `${redirectTo}?token_hash=${tokenHash}&type=recovery`;
```

Use `appResetLink` in the email template instead of `resetLink`.

### ResetPassword Page
Add token-based verification:

```typescript
const [searchParams] = useSearchParams();
const tokenHash = searchParams.get('token_hash');

useEffect(() => {
  if (tokenHash) {
    supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'recovery',
    }).then(({ error }) => {
      if (error) { setTimedOut(true); }
      else { setIsReady(true); }
    });
  }
}, [tokenHash]);
```

This eliminates the dependency on Supabase server-side redirects entirely.
