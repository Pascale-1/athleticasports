

# Enable Deep Linking and Production Sharing URLs

## Overview

Three things need to happen so that links shared via WhatsApp (or SMS) open directly in the native app:

1. **Set `VITE_APP_URL`** so shared links point to `https://athleticasports.app` instead of the preview origin
2. **Configure Android App Links** so Android intercepts `https://athleticasports.app/*` URLs
3. **Configure iOS Universal Links** so iOS intercepts the same URLs
4. **Wire up the `useDeepLink` hook** (it exists but is never mounted)
5. **Host verification files** (`assetlinks.json` for Android, `apple-app-site-association` for iOS) on the domain

---

## Detailed Changes

### 1. Set `VITE_APP_URL` environment variable
Add `VITE_APP_URL=https://athleticasports.app` to `env.example` so all generated share links (events, teams, invitations) use the production domain.

> The actual `.env` is managed automatically, so you will need to set this value in your deployment environment or Lovable project settings.

### 2. Wire up `useDeepLink` hook
The hook at `src/hooks/useDeepLink.ts` already handles parsing `athletica://` and `https://` URLs and calling `navigate()`. But it is **never imported or called** anywhere. Mount it inside `AppRoutes` (or a wrapper component inside `<Router>`) so it listens for incoming URLs on native platforms.

**File**: `src/App.tsx`
- Create a small `<DeepLinkHandler />` component that calls `useDeepLink()` and renders `null`
- Place it inside `<Router>` so it has access to `useNavigate`

### 3. Android App Links
**File**: `android/app/src/main/AndroidManifest.xml`
- Add an `<intent-filter>` with `android:autoVerify="true"` to the main `<activity>` for handling `https://athleticasports.app` URLs:

```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https" android:host="athleticasports.app" />
</intent-filter>
```

- Also add an intent-filter for the custom `athletica://` scheme:

```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="athletica" />
</intent-filter>
```

### 4. iOS Universal Links
**File**: `ios/App/App/Info.plist` (or via Xcode entitlements)
- This requires adding an Associated Domains entitlement (`applinks:athleticasports.app`) to the Xcode project. This is typically done in the `.entitlements` file, not in `Info.plist`.

**New file**: `ios/App/App/App.entitlements`
```xml
<key>com.apple.developer.associated-domains</key>
<array>
    <string>applinks:athleticasports.app</string>
</array>
```

### 5. Host verification files on the domain
For the OS to trust that your app owns the domain, you must serve these files from `https://athleticasports.app/.well-known/`:

**`public/.well-known/assetlinks.json`** (Android)
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.athletica.sports",
    "sha256_cert_fingerprints": ["YOUR_SIGNING_KEY_FINGERPRINT"]
  }
}]
```
> You will need to replace the fingerprint with your actual Android signing key's SHA-256 fingerprint (from `keytool` or Play Console).

**`public/.well-known/apple-app-site-association`** (iOS)
```json
{
  "applinks": {
    "apps": [],
    "details": [{
      "appID": "TEAM_ID.com.athletica.sports",
      "paths": ["/events/*", "/teams/*", "/account/*", "/*"]
    }]
  }
}
```
> Replace `TEAM_ID` with your Apple Developer Team ID.

### 6. Add `VITE_APP_URL` to env.example
Update `env.example` with the new variable so it's documented.

---

## What You Will Need to Do Outside Lovable

These steps **cannot** be done from Lovable and require your local dev environment:

1. **Get your Android SHA-256 fingerprint** and paste it into `assetlinks.json`
2. **Get your Apple Team ID** and paste it into `apple-app-site-association`
3. **Add the Associated Domains capability** in Xcode (Signing & Capabilities tab)
4. **Set `VITE_APP_URL=https://athleticasports.app`** in your deployment environment
5. Run `npx cap sync` after pulling changes
6. **Publish the app** so that `/.well-known/` files are served from the production domain

---

## Files Modified
1. `src/App.tsx` -- mount `DeepLinkHandler`
2. `android/app/src/main/AndroidManifest.xml` -- add intent-filters for app links + custom scheme
3. `ios/App/App/App.entitlements` -- new file for Associated Domains
4. `public/.well-known/assetlinks.json` -- new file (Android verification)
5. `public/.well-known/apple-app-site-association` -- new file (iOS verification)
6. `env.example` -- add `VITE_APP_URL`

