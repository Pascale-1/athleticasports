

# Android Bug Fixes — 6 Issues

## Issues & Root Causes

### 1. "Restart Walkthrough" fires twice
In `ProfileTabs.tsx` line 55-58, `handleRestartWalkthrough` calls `resetWalkthrough()` then navigates to `/`, then `setTimeout(() => startWalkthrough(), 500)`. But `Index.tsx` line 101-106 also has a `useEffect` that calls `startWalkthrough()` when `shouldTrigger()` is true. The `resetWalkthrough` only clears the completed key — it doesn't set the trigger key. So the explicit `setTimeout` call fires the walkthrough, AND if for any reason `shouldTrigger` returns true from a previous session, it fires again. The fix: remove the `setTimeout(() => startWalkthrough(), 500)` from `handleRestartWalkthrough` and instead call `setTrigger()` so the Index page's existing `useEffect` handles it — single responsibility, single invocation.

### 2. No safe area padding (status bar overlap on Android)
The app has zero `safe-area-inset` handling anywhere. On Android with Capacitor, the WebView can render behind the status bar and navigation bar. The fix: add `env(safe-area-inset-top)` padding to the mobile header and `env(safe-area-inset-bottom)` padding to the bottom navigation. Also add the CSS `html { padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left); }` is NOT the right approach — instead, apply it specifically to the sticky header and fixed bottom nav.

### 3. Notification popover positioned too high
`NotificationBell.tsx` uses `<PopoverContent align="end">` but has no `sideOffset` or positioning constraints. On mobile, the popover renders at the top of the viewport clipping behind the status bar. The fix: add `sideOffset={8}` and constrain the popover width for mobile with `className="w-[calc(100vw-2rem)] sm:w-96"` and `align="end"`.

### 4. Height problem (content behind bottom nav / layout overflow)
`MobileLayout.tsx` has `pb-16` on the main content area, and `PageContainer` also adds `pb-16` when `bottomPadding={true}` (default). This creates **double bottom padding** (128px total). The fix: remove `pb-16` from `MobileLayout.tsx`'s `<main>` since `PageContainer` already handles it. Also the bottom nav should account for safe area with `pb-[env(safe-area-inset-bottom)]`.

### 5. Delete account button not working
The edge function `request-account-deletion` uses `RESEND_API_KEY` to send emails. If this secret isn't configured, the function silently fails. But also: the `AlertDialogAction` with `onClick={handleRequestDeletion}` — `AlertDialogAction` has default behavior that closes the dialog. The `onClick` runs but the dialog immediately closes before the async operation completes, and the `emailSent` state gets set on an already-closed dialog. The fix: prevent default close behavior by using `e.preventDefault()` in the onClick, keeping the dialog open until the operation completes.

### 6. Invite dialog: shows all emails + doesn't fit screen
In `InviteMemberDialog.tsx` line 67, the search query returns `email` from profiles and displays it at line 184: `@{user.username}{user.email && ` • ${user.email}`}`. This exposes user emails to anyone searching. Also `DialogContent className="mx-3 sm:mx-auto max-w-md"` doesn't account for safe areas or small screens. Fixes: (a) Remove email from the display — only show `@username`. (b) Remove email from the search query `.select()` to avoid leaking PII. (c) Add `max-h-[85vh] overflow-y-auto` to the DialogContent so it fits on small screens.

## Files Changed

| File | Changes |
|------|---------|
| `src/components/settings/ProfileTabs.tsx` | Fix walkthrough: replace `setTimeout(startWalkthrough)` with `setTrigger()`, let Index handle it |
| `src/index.css` | Add safe-area CSS custom properties for use in components |
| `src/components/mobile/MobileLayout.tsx` | Add `pt-[env(safe-area-inset-top)]` to header, remove `pb-16` from main |
| `src/components/mobile/BottomNavigation.tsx` | Add `pb-[env(safe-area-inset-bottom)]` to bottom nav |
| `src/components/notifications/NotificationBell.tsx` | Add `sideOffset={8}`, mobile-responsive width |
| `src/components/settings/AccountDangerZone.tsx` | Add `e.preventDefault()` to AlertDialogAction onClick to prevent premature close |
| `src/components/teams/InviteMemberDialog.tsx` | Remove email from select/display, add `max-h-[85vh] overflow-y-auto` to DialogContent |

No database changes. No new packages.

