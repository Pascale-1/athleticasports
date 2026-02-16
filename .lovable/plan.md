

# Fix: Use Production Base URL for All Sharing Links

## Problem

All sharing links (event invites, team invites, password reset, etc.) currently use `window.location.origin`, which resolves to the Lovable preview URL (e.g., `https://id-preview--cf052cd2-...lovable.app`). When shared externally, these links:

1. Point to a preview/dev environment, not a stable production URL
2. Will not trigger deep links to open the native app on Android/iOS
3. Look unprofessional to recipients

## Solution

Create a single utility function that returns the correct base URL for sharing. It will use an environment variable (`VITE_APP_URL`) when set, falling back to `window.location.origin` for local development.

## Files to Change

### 1. New file: `src/lib/appUrl.ts`

A small utility that exports a `getAppBaseUrl()` function:
- Returns `import.meta.env.VITE_APP_URL` if set (your production domain, e.g., `https://athleticasports.app`)
- Falls back to `window.location.origin` otherwise (for dev/preview)

### 2. `src/components/events/EventInviteLink.tsx`

Replace `window.location.origin` with `getAppBaseUrl()` on the invite link line.

### 3. `src/components/teams/TeamInviteLink.tsx`

Same replacement for the team invite link.

### 4. `src/hooks/useTeamInvitations.ts`

Replace `window.location.origin` in the `appOrigin` parameter passed to the edge function (used for email invitation links).

### 5. `src/components/settings/ChangePasswordSection.tsx`

Replace `window.location.origin` in the password reset redirect URL.

### 6. `src/pages/Auth.tsx`

Replace `window.location.origin` in the email redirect URL and password reset redirect URL. (The OAuth `redirect_uri` will stay as `window.location.origin` since it must match the actual browser origin for the redirect to work.)

## What You Need to Do After

Once you have a production domain (either by publishing to get a `*.lovable.app` URL or connecting a custom domain like `athleticasports.app`):

1. Add the environment variable `VITE_APP_URL` with your production URL (e.g., `https://athleticasports.app`)
2. For native app deep linking to work from shared links, you will also need to host association files on that domain (`apple-app-site-association` for iOS, `assetlinks.json` for Android) -- this is a separate follow-up step

## Technical Details

- Only 6 files touched, all with a one-line import + one-line replacement
- No visual or behavioral changes in development (falls back to current behavior)
- The OAuth redirect URI in Auth.tsx is intentionally left as `window.location.origin` because it must match the browser's actual origin for the OAuth flow to complete

