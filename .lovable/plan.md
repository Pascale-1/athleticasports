

# App Update Notification

The PWA is configured with `registerType: "autoUpdate"` (VitePWA), which silently updates the service worker in the background. But users are never informed — they might be running stale code until they close all tabs.

## Approach

Use VitePWA's `registerSW` virtual module to detect when a new service worker is waiting, then show a dismissable banner prompting users to reload.

## Changes

### 1. Create `src/components/UpdatePrompt.tsx`
A banner component (similar style to `InstallPrompt`) that:
- Imports `useRegisterSW` from `virtual:pwa-register/react`
- Detects `needRefresh` state (new content available)
- Shows a fixed banner: "A new version is available" with a **"Update now"** button
- Calls `updateServiceWorker(true)` on click → reloads with the new SW
- Dismiss button that hides until next update cycle
- Positioned as a top banner (not bottom, to avoid conflict with InstallPrompt and bottom nav)

### 2. Update `src/App.tsx`
- Import and render `<UpdatePrompt />` alongside `<InstallPrompt />`

### 3. Add i18n keys
**`en/common.json`** — add `update.title`, `update.description`, `update.button`
**`fr/common.json`** — French equivalents

### 4. Add type declaration for virtual module
**`src/vite-env.d.ts`** — add `declare module 'virtual:pwa-register/react'` with `useRegisterSW` types

No database changes needed. Single UI component + wiring.

