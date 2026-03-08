

## Fix Push Notification Flow

### Issues Found

1. **`PushNotificationPrompt` is never mounted** — The component exists (`src/components/notifications/PushNotificationPrompt.tsx`) but is not rendered anywhere in the app. Users are never asked to enable push notifications on first launch.

2. **No auto-registration on app launch** — Even if a user previously granted permission, the hook only registers when explicitly called via `subscribe()`. On a fresh app launch, the device token is never sent to the server unless the user manually toggles the setting.

3. **No notification trigger for chat messages** — There's no database trigger to create a notification row when a team chat message is sent, so chat messages never trigger push notifications.

4. **In-app notification center already exists** — The `NotificationBell` + `NotificationPanel` already serve as the fallback in-app notification center. No new work needed here, but it could use a dedicated full-page view on mobile for better UX.

### Plan

**1. Mount `PushNotificationPrompt` in `AppLayout` and `MobileLayout`**
- Import and render `<PushNotificationPrompt />` in both layout components so users see the permission prompt on first authenticated launch.

**2. Auto-register on app launch when permission is already granted**
- In `usePushNotifications.ts`, add logic: if `permissionState === "granted"` and `!isSubscribed`, automatically call `PushNotifications.register()` to refresh the device token. This ensures the token is always current after app reinstalls or token rotations.

**3. Add chat message notification trigger (database migration)**
- Create a trigger function `notify_team_chat_message()` on the `team_messages` table that creates a notification for all other active team members when a message is inserted. This will cascade through the existing `trigger_push_notification` trigger on the `notifications` table.

**4. Add a dedicated Notifications page for mobile**
- Create `src/pages/Notifications.tsx` — a full-page view of all notifications (reuses `NotificationPanel`).
- Add a route `/notifications` in `App.tsx`.
- Add a bell icon / nav item in `BottomNavigation.tsx` with unread badge.

### Files Changed
| File | Change |
|---|---|
| `src/components/AppLayout.tsx` | Mount `<PushNotificationPrompt />` |
| `src/components/mobile/MobileLayout.tsx` | Mount `<PushNotificationPrompt />` |
| `src/hooks/usePushNotifications.ts` | Auto-register when permission already granted |
| `src/pages/Notifications.tsx` | New full-page notification center |
| `src/App.tsx` | Add `/notifications` route |
| `src/components/mobile/BottomNavigation.tsx` | Add notifications tab with badge |
| Database migration | Add `notify_team_chat_message()` trigger |

