

# UI Modernization — Align Components to Ignite Design Spec

Most tokens and spacing are already applied from previous work. This pass fixes the remaining mismatches: nav behavior, RSVP bar sizing, accent colors, empty states, and Home screen density.

---

## Files to modify (~14 files)

### 1. `src/components/mobile/BottomNavigation.tsx`
- Nav background: `bg-card` (surface) instead of `bg-background/95`
- Badge: `bg-accent text-accent-foreground` instead of `bg-destructive`
- Inactive tabs: hide label text (show only for active tab)
- Active pill: `bg-primary/10` with `rounded-lg` (8px radius, 28px height)

### 2. `src/components/events/EventCard.tsx`
- Left accent border mapping: `training → border-l-primary`, `match → border-l-accent`, `meetup → border-l-success` (currently uses `info`/`warning`)
- Update `TYPE_ACCENT` map and tinted backgrounds accordingly

### 3. `src/components/events/EventRSVPBar.tsx`
- Reduce button height from `h-[52px]` to `h-9` (36px)
- Going active: `bg-success text-white` 
- Maybe active: `bg-muted text-foreground` (surface-elevated)
- Can't Go active: `bg-destructive/10 text-destructive` (danger-subtle)
- Remove separate "Cancel" link — re-tap toggles off (already implemented)

### 4. `src/components/notifications/NotificationBell.tsx`
- Badge: `bg-accent text-accent-foreground` instead of `bg-destructive`

### 5. `src/components/EmptyState.tsx`
- Icon circle: `bg-accent/10` instead of `bg-muted`
- Icon color: `text-accent` instead of `text-muted-foreground`

### 6. `src/pages/Index.tsx`
- Greeting: reduce from `text-[22px]` to `text-[18px]` (spec max)
- Subtitle: reduce from `text-[14px]` to `text-[12px]`
- Stats numbers: reduce from `text-[28px]` to `text-[20px]`
- Main spacing: `space-y-6` → `space-y-3`
- Quick action buttons: reduce height from `h-[52px]` to `h-11` (44px)
- Team row: reduce height from `h-14` to `h-11`

### 7. `src/pages/EventDetail.tsx`
- Section header color: ensure `text-hint` utility class is used (maps to `#9CA3AF`)
- Where & When card date box: keep current sizing, reduce `h-12 w-12` to `h-10 w-10`

### 8. `src/components/events/EventCardSkeleton.tsx`
- Add shimmer animation class (`animate-shimmer`) to skeleton elements for proper loading state

### 9. `src/components/ui/sonner.tsx`
- Verify toast has `border-l-[3px] border-l-accent` and bottom positioning

### 10. `src/components/events/EventTemplateSelector.tsx`
- Update type colors: training → `primary`, match → `accent`, meetup → `success`

### 11. `src/components/teams/EventsPreview.tsx`
- Same type color update as EventTemplateSelector

### 12. `src/lib/eventConfig.ts`
- Update event type config colors to use CSS variable references matching new token mapping (training=navy, match=orange, meetup=green)

### 13. `src/components/ui/skeleton.tsx`
- Ensure skeleton uses `bg-muted animate-shimmer` for proper shimmer effect on loading states

### 14. `src/components/feed/FeedSkeleton.tsx`
- Ensure shimmer animation is applied

---

## Summary of changes

| Element | Before | After |
|---------|--------|-------|
| Nav badge | `bg-destructive` (red) | `bg-accent` (orange) |
| Nav inactive | Shows label | Icon only, no label |
| Nav background | `bg-background` | `bg-card` (white surface) |
| RSVP buttons | 52px tall | 36px tall |
| Going button | `bg-primary` (navy) | `bg-success` (green) |
| Maybe button | `bg-warning` (orange) | `bg-muted` (surface) |
| Can't Go | `bg-destructive` (red) | `bg-destructive/10 text-destructive` |
| Event accent: training | `border-l-info` | `border-l-primary` (navy) |
| Event accent: match | `border-l-warning` | Custom accent class |
| Notification badge | `bg-destructive` | `bg-accent` (orange) |
| Empty state icon | `bg-muted` gray | `bg-accent/10` orange tint |
| Home greeting | 22px | 18px |
| Home stats | 28px | 20px |
| Home spacing | space-y-6 | space-y-3 |
| Skeleton loading | Static pulse | Shimmer animation |

