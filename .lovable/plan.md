

# Modernize Athletica App UI

This is a large visual overhaul touching typography, spacing, shadows, navigation, and several component refinements across ~15 files. No logic or data changes.

---

## Files to modify

| File | Changes |
|------|---------|
| `tailwind.config.ts` | Update semantic font size scale, add `card-soft` shadow |
| `src/index.css` | Add sport-accent utility classes |
| `src/components/ui/card.tsx` | Replace border with soft shadow on default/interactive variants |
| `src/components/ui/badge.tsx` | Update default size to h-[22px] px-2, 11px medium |
| `src/components/mobile/BottomNavigation.tsx` | Reduce to 52px, 22px icons, 11px labels, add active pill bg |
| `src/components/mobile/PageHeader.tsx` | Title to 22px bold |
| `src/components/events/EventCard.tsx` | Title 15px, metadata 13px #6B7280, truncate address to city |
| `src/components/events/EventAttendees.tsx` | Avatars 28px, auto-expand if ≤5 attendees |
| `src/components/events/EventRSVPBar.tsx` | Already good — no changes needed |
| `src/components/teams/TeamCard.tsx` | Title 15px, sport ribbon as slim separator (6px top/4px bottom), add sport accent left border, metadata 13px |
| `src/components/teams/TeamMemberCard.tsx` | Unify owner/admin badge: gold pill for owner, blue pill for admin with icon |
| `src/pages/EventDetail.tsx` | Section headers 14px semibold uppercase tracking-wider, reduce spacing to 12px, tighten header area |
| `src/pages/Events.tsx` | Card gap to 8px, horizontal padding 16px |
| `src/pages/Teams.tsx` | Card gap to 8px, horizontal padding 16px |
| `src/pages/Index.tsx` | Horizontal padding 16px |
| `src/components/EmptyState.tsx` | Already supports emoji — update default messaging |

---

## 1. tailwind.config.ts — Typography scale update

Update semantic font sizes:
- `page-title`: `1.375rem` (22px), lineHeight `1.75rem`, fontWeight `700`
- `card-title`: `0.9375rem` (15px), lineHeight `1.25rem`, fontWeight `600`
- `section`: `0.875rem` (14px), lineHeight `1.125rem`, fontWeight `600`
- `body`: keep 14px
- `caption`: keep 12px
- Also update legacy `h1`/`display` to match 22px

Add box-shadow:
- `card-soft`: `0 2px 8px rgba(0,0,0,0.07)`

## 2. src/components/ui/card.tsx — Soft shadow, remove heavy borders

Update `default` variant: remove `border`, add `shadow-card-soft`
Update `interactive` variant: same shadow treatment
Update `elevated` variant: same shadow treatment
Keep `border` only on `bordered` variant

```
default: "rounded-2xl shadow-card-soft bg-card text-card-foreground transition-all duration-200 active:scale-[0.99]",
interactive: "rounded-2xl shadow-card-soft bg-card text-card-foreground transition-all duration-150 cursor-pointer active:scale-[0.98] hover:shadow-md",
```

## 3. src/components/mobile/BottomNavigation.tsx — Compact + active pill

- Nav height: `h-[calc(52px+env(safe-area-inset-bottom))]`
- Icon size: `h-[22px] w-[22px]`
- Label: `text-[11px]`
- Active state: add `bg-primary/10 rounded-full px-2 py-0.5` pill behind icon+label group
- Remove the top indicator line, use the pill bg instead

## 4. src/components/mobile/PageHeader.tsx — 22px title

Change `text-page-title` (which will now be 22px from tailwind config update).

## 5. src/components/events/EventCard.tsx — Tighter card

- Title: `text-[15px]` (was 17px)
- Metadata (time, location): `text-[13px] text-[#6B7280]`
- Address truncation for list cards: extract city name from address (last segment after comma, or full if no comma)

```tsx
const cityName = venueName?.includes(',') 
  ? venueName.split(',').pop()?.trim() 
  : venueName;
```

Show `cityName` in list card, full address stays on detail page.

## 6. src/components/events/EventAttendees.tsx — Smaller avatars + auto-expand

- Avatar size: `h-7 w-7` (28px) instead of `h-9 w-9` (36px)
- If total attendees ≤ 5: remove the expand/collapse button, show all sections inline directly
- Overflow avatar: also `h-7 w-7`

## 7. src/components/teams/TeamCard.tsx — Sport accent + tighter layout

- Title: `text-[15px]` (was card-title / 17px)
- Sport ribbon: reduce padding to `px-3 py-1` with `mt-1.5 mb-1` — slim inline separator
- Add sport-specific left border color:
  ```tsx
  const sportAccent: Record<string, string> = {
    football: 'border-l-green-500',
    basketball: 'border-l-orange-500',
    volleyball: 'border-l-yellow-500',
  };
  ```
  Apply as `border-l-[4px]` on the Card
- Metadata (member count): `text-[13px] text-[#6B7280]`

## 8. src/components/teams/TeamMemberCard.tsx — Unified role badges

Update `roleColors`:
```tsx
owner: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900 dark:text-amber-200",
admin: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200",
```
Add icons: Crown for owner, Shield for admin. Both use pill style with icon + text.

## 9. src/pages/EventDetail.tsx — Tighter spacing + section headers

- Main container: `space-y-3` (was space-y-4, = 12px)
- Section headers: `text-[14px] font-semibold uppercase tracking-[0.5px]` (was 13px lowercase)
- Hero header: reduce `pb-5` to `pb-3`, reduce `mb-4` (back button row) to `mb-2`, reduce title `mb-2` to `mb-1`
- Remove gap between calendar button and first card

## 10. src/pages/Events.tsx + Teams.tsx — Card gap + padding

- Card list `gap-3` → `gap-2` (8px)
- Ensure `px-4` (16px) horizontal padding on PageContainer content

## 11. src/components/ui/badge.tsx — Consistent sizing

Update default size variant:
- `sm`: `px-2 py-0 text-[11px] h-[22px]` (was px-1.5 h-4)
- This makes all badges consistent 22px height with 8px horizontal padding

## 12. src/index.css — Sport accent utilities

Add utility classes for sport-specific accent colors:
```css
.sport-accent-football { border-left-color: #22c55e; }
.sport-accent-basketball { border-left-color: #f97316; }
.sport-accent-volleyball { border-left-color: #eab308; }
```

## 13. Empty states — Illustrated French messages

Already supported via `EmptyState` component with `emoji` prop. Update specific usages:
- Teams (no teams): emoji `🏃‍♀️`, message "Aucune équipe près de toi pour l'instant", description with CTA
- Events (empty tab): already handled
- These are in translation files — no code change needed beyond what's already done

---

## Summary

| Change | Impact |
|--------|--------|
| Font sizes reduced globally | page-title 22px, card-title 15px, section 14px uppercase |
| Card shadows replace borders | `0 2px 8px rgba(0,0,0,0.07)` soft shadow |
| Bottom nav compacted | 52px height, 22px icons, active pill bg |
| Card gaps tightened | 8px between list cards |
| Section spacing reduced | 12px throughout event detail |
| Sport accent colors | Left border on team cards by sport |
| Attendee avatars smaller | 28px, auto-expand ≤5 |
| Role badges unified | Gold owner pill, blue admin pill with icons |
| Address truncated in list | City only in cards, full on detail |
| Badge sizing standardized | 22px height, 11px text |

