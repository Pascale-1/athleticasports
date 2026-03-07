

## Mobile App Assessment -- Bugs and Issues Found

### Bug 1: Excessive Console Logging (Performance)
**File:** `src/hooks/useEventAttendance.ts` line 47
**Severity:** Medium

`console.log('[Attendance] Current user:', user?.id)` fires on every `fetchAttendance` call. The console shows 16+ repeated logs in quick succession. This also calls `supabase.auth.getUser()` (a network request) every time, when it should use the cached session.

**Fix:** Remove the `console.log` and replace `supabase.auth.getUser()` with `supabase.auth.getSession()` to avoid unnecessary network calls.

---

### Bug 2: Session Activity Listener Triggers Network Requests on Every Interaction
**File:** `src/integrations/supabase/client.ts` lines 54-64
**Severity:** High

Every `mousedown`, `keydown`, `touchstart`, and `scroll` event triggers `supabase.auth.getSession()`. On mobile, scrolling generates dozens of events per second, each triggering a session lookup. This is a performance drain, especially on slower connections.

**Note:** This file is auto-generated and cannot be edited. This is a known limitation -- flagging it for awareness.

---

### Bug 3: Push Notifications Not Registered on iOS (Missing Podfile Entry)
**File:** `ios/App/Podfile`
**Severity:** High

The `@capacitor/push-notifications` package is installed in `package.json` but is **not listed in the Podfile**. This means iOS builds won't include the push notification native plugin. The pod `CapacitorPushNotifications` must be added.

**Fix:** Add `pod 'CapacitorPushNotifications', :path => '../../node_modules/@capacitor/push-notifications'` to the Podfile.

---

### Bug 4: Push Notifications Missing Android Permission
**File:** `android/app/src/main/AndroidManifest.xml`
**Severity:** High

Android 13+ (API 33+) requires `android.permission.POST_NOTIFICATIONS` in the manifest. It's missing. Users on Android 13+ will never receive push notifications.

**Fix:** Add `<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />` to AndroidManifest.xml.

---

### Bug 5: iOS AppDelegate Missing Push Notification Registration
**File:** `ios/App/App/AppDelegate.swift`
**Severity:** High

The AppDelegate does not implement `didRegisterForRemoteNotificationsWithDeviceToken` or `didFailToRegisterForRemoteNotificationsWithDeviceToken`. Without these, the device token is never forwarded to Capacitor, so push registration silently fails.

**Fix:** Add the two delegate methods to forward the token to Capacitor's notification center.

---

### Bug 6: iOS Missing Push Notification Entitlement
**File:** `ios/App/App/App.entitlements`
**Severity:** High

The entitlements file does not include `aps-environment`. Without this, the app cannot register for push notifications on iOS.

**Fix:** Add `<key>aps-environment</key><string>production</string>` to the entitlements plist.

---

### Bug 7: Index Page Creates Its Own Auth Listener (Redundant)
**File:** `src/pages/Index.tsx` lines 81-102
**Severity:** Low

The Index page sets up its own `onAuthStateChange` + `getSession` listener, duplicating what `useAuth()` and `ProtectedRoute` already do. This creates extra auth subscriptions and redundant network calls. Should use `useAuth()` hook instead.

**Fix:** Replace the manual auth listener with `const { user } = useAuth()` and fetch profile on user change.

---

### Summary Table

| # | Issue | Platform | Severity | Type |
|---|-------|----------|----------|------|
| 1 | Excessive attendance logging + network calls | Both | Medium | Performance |
| 2 | Session listener on every touch/scroll | Both | High | Performance (unfixable -- auto-generated) |
| 3 | Push notifications pod missing in iOS Podfile | iOS | High | Native config |
| 4 | Missing POST_NOTIFICATIONS permission | Android | High | Native config |
| 5 | AppDelegate missing push token forwarding | iOS | High | Native config |
| 6 | Missing aps-environment entitlement | iOS | High | Native config |
| 7 | Redundant auth listener on Index page | Both | Low | Code quality |

### Recommended Fix Order
1. Fix bugs 3-6 (push notification setup for both platforms)
2. Fix bug 1 (remove console.log, use getSession)
3. Fix bug 7 (use useAuth hook in Index page)

