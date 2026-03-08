

## Make In-App Notification Toasts Auto-Dismiss

### Problem
The notification context (`NotificationContext.tsx`) and other parts of the app use shadcn's `useToast()` which renders via `<Toaster>`. These toasts are sticky -- they require the user to click "X" to dismiss them.

### Recommendation
Switch notification toasts to use **Sonner** (`toast()` from `sonner`), which already auto-dismisses after a few seconds. Sonner is already installed and rendered in `App.tsx`.

Alternatively, we could add a `duration` prop to shadcn toasts, but Sonner is purpose-built for this and already configured.

### Changes

**1. `src/contexts/NotificationContext.tsx`**
- Replace `import { useToast } from "@/hooks/use-toast"` with `import { toast } from "sonner"`
- Change the realtime notification toast from:
  ```ts
  toast({ title: newNotification.title, description: newNotification.message });
  ```
  to:
  ```ts
  toast(newNotification.title, { description: newNotification.message, duration: 5000 });
  ```
- Remove the `useToast` hook call and its dependency in `useCallback`.

**2. Audit other `useToast()` calls** across the app (e.g. in hooks like `useTeamInvitations`, `useEvents`, etc.) and switch success/info toasts to Sonner as well, keeping shadcn toasts only for action-required toasts (if any). This is optional but would make UX consistent.

### Result
Notification toasts will auto-dismiss after 5 seconds. Users can still hover to pause or swipe to dismiss early.

