

# Strava-inspired Typography & Density Overhaul

Aggressive reduction of all font sizes, spacing, and padding to achieve a compact, data-dense mobile UI. Changes cascade through theme tokens where possible, with targeted component edits for hardcoded values.

---

## Files to modify

| File | Changes |
|------|---------|
| `tailwind.config.ts` | Redefine fontSize scale, spacing scale, borderRadius, shadows |
| `src/index.css` | Update CSS variables, utility classes |
| `src/components/ui/card.tsx` | Card padding to 10px/14px, border-radius 10px |
| `src/components/ui/badge.tsx` | Height 20px, px 6px, text 9px |
| `src/components/ui/button.tsx` | Base text 12px medium, reduce heights |
| `src/components/ui/input.tsx` | Text 12px, height reduce |
| `src/components/ui/textarea.tsx` | Text 12px |
| `src/components/mobile/BottomNavigation.tsx` | 50px height, 20px icons, 9px labels, active pill |
| `src/components/mobile/PageHeader.tsx` | Title 18px, subtitle 11px |
| `src/components/mobile/PageContainer.tsx` | Default padding to 14px horizontal |
| `src/components/mobile/FAB.tsx` | 44px size, adjust bottom position |
| `src/components/events/EventCard.tsx` | Title 13px, metadata 12px, tighter padding |
| `src/components/events/EventsList.tsx` | Gap 1 (4px) |
| `src/components/events/EventAttendees.tsx` | Avatar sizes reduced |
| `src/components/teams/TeamCard.tsx` | Title 13px, metadata 12px, avatar 32px |
| `src/components/ui/avatar-stack.tsx` | Reduce all sizes |
| `src/pages/EventDetail.tsx` | Section headers 11px, spacing space-y-2, tighter hero |
| `src/pages/Events.tsx` | Gap 1, padding adjustments |
| `src/pages/Teams.tsx` | Gap 1, space-y-3 sections |

---

## 1. tailwind.config.ts — New Strava-scale tokens

```
fontSize:
  "page-title": ["1.125rem", { lineHeight: "1.375rem", fontWeight: "700" }]    // 18px
  "screen-title": ["1rem", { lineHeight: "1.25rem", fontWeight: "700" }]       // 16px
  "card-title": ["0.8125rem", { lineHeight: "1.125rem", fontWeight: "600" }]   // 13px
  "section": ["0.6875rem", { lineHeight: "0.875rem", fontWeight: "600" }]      // 11px
  "body": ["0.75rem", { lineHeight: "1.0625rem" }]                             // 12px
  "body-sm": ["0.6875rem", { lineHeight: "0.9375rem" }]                        // 11px
  "caption": ["0.6875rem", { lineHeight: "0.875rem" }]                         // 11px
  "micro": ["0.5625rem", { lineHeight: "0.75rem" }]                            // 9px
  + update all legacy aliases (display/h1=18px, h2=13px, h3=12px, h4=11px)

borderRadius:
  sm: "0.375rem"    // 6px
  md: "0.5rem"      // 8px  
  lg: "0.625rem"    // 10px
  xl: "1rem"        // 16px

boxShadow:
  "card-soft": "0 1px 4px rgba(0, 0, 0, 0.06)"  // lighter for denser layout
```

## 2. src/index.css — CSS variables

No changes needed — text color tokens already match spec.

## 3. card.tsx — Compact padding + radius

- All variants: `rounded-[10px]` instead of `rounded-2xl`
- CardHeader: `p-2.5 px-3.5` (10px/14px)
- CardContent: `p-2.5 px-3.5 pt-0`
- CardFooter: `p-2.5 px-3.5 pt-0`
- CardTitle: `text-[13px]`
- CardDescription: `text-[12px]`

## 4. badge.tsx — 20px height, 9px text

- Base: `text-[9px] font-medium`
- Size `sm`: `px-1.5 py-0 text-[9px] h-[20px]`
- Size `xs`: `px-1 py-0 text-[8px] h-3.5`
- Size `md`: `px-2 py-0.5 text-[10px]`

## 5. button.tsx — 12px medium labels

- Base cva: `text-[12px] font-medium` (was 13px semibold)
- Size `default`: `h-9 px-3.5 py-2 min-h-[36px]`
- Size `sm`: `h-8 px-3 py-1.5 text-[11px] min-h-[32px]`
- Size `lg`: `h-10 px-5 py-2 text-[12px] min-h-[40px]`
- Size `icon`: `h-9 w-9 min-h-[36px] min-w-[36px]`

## 6. input.tsx — 12px text, compact height

- `h-10` (was h-12), `text-[12px]`, `px-3 py-2`

## 7. textarea.tsx — 12px text

- `text-[12px]`

## 8. BottomNavigation.tsx — 50px, 20px icons, 9px labels

- Nav height: `h-[calc(50px+env(safe-area-inset-bottom))]`
- Icon: `h-5 w-5` (20px)
- Label: `text-[9px]`
- Active pill: keep existing `bg-primary/10` approach
- Tighter gap: `gap-0`

## 9. PageHeader.tsx — 18px title, 11px subtitle

- Title: `text-[18px]` (was text-page-title which was 20px)
- Subtitle: `text-[11px]`
- Reduce `pb-3` → `pb-2`, `space-y-1` → `space-y-0.5`
- Back button: `text-[10px]`, `h-6`

## 10. PageContainer.tsx — 14px horizontal padding

- `compact`: `px-3.5 py-2`
- `default`: `px-3.5 py-2`
- `spacious`: `px-4 py-3`

## 11. FAB.tsx — 44px

- `h-11 w-11` (44px, was h-14 w-14)
- `bottom-16 right-3.5`

## 12. EventCard.tsx — Ultra-compact

- Title: `text-[13px]` (was 14px)
- Time/location metadata: `text-[12px]`
- DateBlock area: `px-2.5 py-2.5`
- Content area: `px-2.5 py-2`
- Gap between rows: `gap-1` (was gap-1.5)
- Attendance text: `text-[10px]`
- Public/Private labels: `text-[9px]`
- Icon sizes in metadata: `h-2.5 w-2.5`

## 13. EventsList.tsx — 4px gap

- `space-y-1` (was space-y-3)

## 14. EventAttendees.tsx — Smaller avatars

- Main avatar size: `h-6 w-6` (24px for member rows)
- Reduce from current h-7 w-7

## 15. TeamCard.tsx — Compact

- Title: `text-[13px]`
- Avatar: `h-8 w-8` (32px, was h-12 w-12)
- AvatarFallback text: `text-sm` (was text-lg)
- Sport ribbon: `text-[11px]`, `px-2.5 py-0.5 mt-1 mb-0.5`
- Description: `text-[11px]`
- Members row: `text-[12px]`
- Content padding: `p-2.5`
- Member row icons: `h-2.5 w-2.5`

## 16. avatar-stack.tsx — Smaller

- `xs`: `h-4 w-4 text-[7px]`
- `sm`: `h-5 w-5 text-[8px]`
- `md`: `h-6 w-6 text-[9px]`

## 17. EventDetail.tsx — Tight detail page

- Main container: `space-y-2` (was space-y-3)
- Section headers: `text-[11px] uppercase tracking-[0.8px]` with `text-hint` color
- Card content padding: `p-3` (was p-4)
- Hero `pb-3` → `pb-2`, `pt-3` → `pt-2`
- Title: `text-[16px]` (was text-screen-title = 18px)
- Badge text: `text-[10px]` with `px-2 py-0.5`
- Back button: `h-8` (was h-9)
- Reduce `mb-3` after badges → `mb-2`
- Reduce `mb-4` after section headers → `mb-2`

## 18. Events.tsx — Tight list

- Main `space-y-3` → `space-y-2`
- Tab bar: `h-10` (was h-12), tab text `text-[12px]`
- Filter chips: `h-7 px-2.5 text-[10px]`
- Section time group headers: already use `text-section` which will now be 11px
- Skeleton/loading gaps: `space-y-1`

## 19. Teams.tsx — Tight list

- Main `space-y-6` → `space-y-3`
- Grid gap: `gap-1` (4px, was gap-2)
- View toggle pills: `h-8 text-[11px]`
- Loading skeleton gaps: `gap-1`

---

## Summary

| Token | Before | After |
|-------|--------|-------|
| page-title | 20px | 18px |
| screen-title | 18px | 16px |
| card-title | 14px | 13px |
| section | 12px | 11px |
| body | 13px | 12px |
| micro | 10px | 9px |
| Card radius | 16px | 10px |
| Card gap in lists | 12px | 4px |
| Card padding | 12-16px | 10-14px |
| Bottom nav | 52px | 50px |
| Nav icons | 22px | 20px |
| Nav labels | 10px | 9px |
| FAB size | 56px | 44px |
| Badge height | 22px | 20px |
| Button height | 40px | 36px |
| Input height | 48px | 40px |
| Screen h-padding | 16px | 14px |
| Team avatar | 48px | 32px |
| Avatar stack xs | 20px | 16px |

