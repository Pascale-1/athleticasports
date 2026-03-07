

## Add Subtle Theme Toggle to Headers

Add a small sun/moon icon button next to the notification bell in both mobile and desktop headers.

### Changes

**`src/components/mobile/MobileLayout.tsx`**:
- Import `useTheme` from `next-themes` and `Sun`/`Moon` from lucide
- Add a small ghost icon button (just the icon, no label) before the `NotificationBell` in the `ml-auto` div
- Clicking toggles between light/dark (skip system — just toggle)

**`src/components/AppLayout.tsx`**:
- Same pattern: add the toggle button before `NotificationBell` in the desktop header

The button will be a `Button variant="ghost" size="icon"` with reduced dimensions (`h-7 w-7`) showing `Sun` in dark mode and `Moon` in light mode, with `text-muted-foreground` for subtlety.

