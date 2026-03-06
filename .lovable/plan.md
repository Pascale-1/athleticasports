

# Fix All Share Links for iOS & Android

## Issues Found

There are **3 share locations** in the app. Two have problems:

### 1. `Settings.tsx` — Share Profile ✅ 
Already uses `navigator.share()` → clipboard fallback correctly.

### 2. `EventInviteLink.tsx` — Share Event ⚠️ Minor issue
- Copy button uses the robust `copyToClipboard` from `lib/clipboard.ts` — good
- WhatsApp share uses `openExternalUrl` — good
- **SMS share uses `window.location.href`** — this navigates away from the app on native. Should use `openExternalUrl` for consistency, but SMS scheme may not work via Capacitor Browser. Better approach: use `navigator.share()` as primary action (like Settings does), keep WhatsApp/SMS as secondary options.
- **No native share sheet option** — missing `navigator.share()` as the primary share action

### 3. `TeamInviteLink.tsx` — Share Team ❌ Multiple issues
- **`copyToClipboard` is a local function using only `navigator.clipboard.writeText`** — no fallback, will silently fail in iframes and some native contexts
- **SMS share uses `window.location.href`** — same issue as events
- **No native share sheet option** — no `navigator.share()` at all
- WhatsApp share uses `openExternalUrl` — good

## Plan

### A. `TeamInviteLink.tsx` — Fix clipboard and add native share
1. Replace local `copyToClipboard` with the robust one from `@/lib/clipboard`
2. Add a primary "Share" button that uses `navigator.share()` with clipboard fallback (same pattern as Settings)
3. Change SMS to not use `window.location.href` directly — use the same share sheet approach

### B. `EventInviteLink.tsx` — Add native share option
1. Add `navigator.share()` as the primary share dropdown option (above WhatsApp/SMS)
2. Keep WhatsApp and SMS as explicit secondary options in the dropdown

### C. Both components — Fix SMS handling
- For SMS, keep `window.location.href = sms:...` but wrap it so it doesn't break navigation on native. The `sms:` scheme is handled by the OS directly and works fine — the real fix is ensuring the primary share path uses `navigator.share()`.

## Files to Change

| File | Change |
|------|--------|
| `src/components/teams/TeamInviteLink.tsx` | Import shared `copyToClipboard`, add `navigator.share()` primary share button |
| `src/components/events/EventInviteLink.tsx` | Add `navigator.share()` option in share dropdown |

