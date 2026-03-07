

## Plan: Web Push Notification System

### Overview

Add push notifications so users receive alerts on their home screen even when the app is closed. This covers the **PWA (Web Push)** path. Native Capacitor push would require Firebase/APNs setup which is a separate effort.

### Architecture

```text
┌─────────────┐     INSERT notification     ┌──────────────────────┐
│  DB Trigger  │ ──────────────────────────► │ send-push-notification│
│ (pg_net call)│                             │   (Edge Function)     │
└─────────────┘                             └──────┬───────────────┘
                                                   │ web-push library
                                                   ▼
                                            ┌──────────────┐
                                            │ Browser Push  │
                                            │  Service      │
                                            └──────────────┘
```

### Components

**1. Database: `push_subscriptions` table**
- Stores Web Push subscriptions per user (endpoint, p256dh key, auth key)
- Columns: `id`, `user_id`, `endpoint`, `p256dh`, `auth`, `created_at`
- RLS: users can INSERT/SELECT/DELETE their own subscriptions only

**2. VAPID Keys (secrets)**
- Generate a VAPID key pair (public + private)
- Store `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` as secrets
- The public key is also exposed client-side (it's publishable)

**3. Edge Function: `send-push-notification`**
- Triggered by a DB trigger on `notifications` INSERT (via `pg_net`)
- Reads the new notification row, fetches all `push_subscriptions` for that `user_id`
- Sends Web Push to each subscription using the `web-push` protocol
- Cleans up expired/invalid subscriptions (410 responses)

**4. DB Trigger: `trigger_push_on_notification`**
- On INSERT to `notifications`, calls `send-push-notification` edge function via `pg_net`
- This means every existing notification trigger (team invitation, announcement, event RSVP, etc.) automatically gets push — no changes needed to those triggers

**5. Service Worker: push event handler**
- Add a custom service worker file that listens for `push` events
- Displays the notification with title, body, icon, and click URL
- On `notificationclick`, opens/focuses the app at the notification's link
- Integrate with VitePWA's `injectManifest` or add as an `importScripts` entry

**6. Client: Permission prompt + subscription management**
- `src/hooks/usePushNotifications.ts` — handles requesting permission, subscribing, saving subscription to DB, and unsubscribing
- Permission prompt component shown after first login (or in settings)
- Settings toggle to enable/disable push notifications

**7. Settings UI**
- Add a "Push Notifications" toggle in the Settings tab
- Shows current permission state (granted/denied/default)
- If denied, explain how to re-enable in browser settings

### Files to Create/Edit

| File | Action | Description |
|------|--------|-------------|
| DB migration | Create | `push_subscriptions` table + RLS + trigger on `notifications` |
| `supabase/functions/send-push-notification/index.ts` | Create | Edge function that sends Web Push |
| `supabase/config.toml` | Edit | Add `send-push-notification` function config |
| `public/sw-push.js` | Create | Push event handler for service worker |
| `vite.config.ts` | Edit | Configure VitePWA to include custom SW code |
| `src/hooks/usePushNotifications.ts` | Create | Permission, subscribe/unsubscribe logic |
| `src/components/notifications/PushNotificationPrompt.tsx` | Create | UI prompt to enable push |
| `src/components/settings/ProfileTabs.tsx` | Edit | Add push notification toggle in settings |
| `src/i18n/locales/en/common.json` | Edit | Add push notification strings |
| `src/i18n/locales/fr/common.json` | Edit | Add French push notification strings |

### Secrets Required

- `VAPID_PUBLIC_KEY` — VAPID public key (also used client-side, so will be hardcoded in code)
- `VAPID_PRIVATE_KEY` — VAPID private key (secret, used only in edge function)

I'll generate the VAPID keys and ask you to store the private key as a secret.

### How It Works End-to-End

1. User logs in → app checks if push is supported and permission state
2. If first time, a prompt appears: "Enable push notifications to stay updated"
3. User taps "Enable" → browser shows native permission dialog
4. If granted → subscription created via `PushManager.subscribe()` → saved to `push_subscriptions` table
5. Any time a notification is inserted (team invite, event RSVP, etc.) → DB trigger fires → edge function sends Web Push
6. User sees notification on home screen / lock screen
7. Tapping it opens the app at the relevant page

