

# Unified Design System — Global Revamp

## Scope
Apply a consistent design system across the entire app: typography scale, card styles, spacing, icons, colors, and bottom navigation. No logic, data, or navigation changes.

## Files to modify (12 files)

| File | Changes |
|------|-------|
| `tailwind.config.ts` | Update fontSize scale to match spec (24/17/14/13/12px) |
| `src/index.css` | Remove shadow-card references from Card variants, update shadow vars |
| `src/components/ui/card.tsx` | Standardize all variants to rounded-2xl, bg-card, border, no shadow |
| `src/components/mobile/BottomNavigation.tsx` | Icons to 24px, underline indicator, border-t to full opacity |
| `src/components/mobile/PageHeader.tsx` | Title to 24px bold tracking-tight |
| `src/components/events/EventCard.tsx` | Remove hardcoded colors, use token-only; card rounded-2xl |
| `src/components/teams/TeamCard.tsx` | Sport ribbon: remove hardcoded uppercase tracking; card consistency |
| `src/pages/Index.tsx` | Replace remaining hardcoded success-green section colors; enforce spacing mb-6; card padding px-4 py-3 |
| `src/pages/Events.tsx` | Enforce section gap mb-6, card gap gap-3, tab bar consistency |
| `src/pages/Teams.tsx` | Enforce spacing rhythm, card gap gap-3 |
| `src/pages/Settings.tsx` | Enforce spacing rhythm |
| `src/components/mobile/FAB.tsx` | Remove shadow-lg, keep shadow-sm only |

---

## 1. Typography Scale (`tailwind.config.ts`)

Current fontSize values are ultra-compressed (page-title: 16px, section: 11px, card-title: 11px, body: 11px). The spec requires:
- page-title: 24px bold tracking-tight
- section: 13px semibold muted
- card-title: 17px semibold  
- body: 14px normal
- caption: 12px muted

Update the semantic fontSize entries in tailwind.config.ts lines 28-44:
```
"page-title": ["1.5rem", { lineHeight: "2rem", fontWeight: "700" }],         // 24px
"section": ["0.8125rem", { lineHeight: "1.125rem", fontWeight: "600" }],     // 13px
"card-title": ["1.0625rem", { lineHeight: "1.375rem", fontWeight: "600" }],  // 17px
"body": ["0.875rem", { lineHeight: "1.25rem" }],                             // 14px
"body-sm": ["0.75rem", { lineHeight: "1.0625rem" }],                        // 12px
"caption": ["0.75rem", { lineHeight: "1rem" }],                              // 12px
"micro": ["0.625rem", { lineHeight: "0.875rem" }],                           // 10px
```
Also update legacy sizes:
```
"display": ["1.5rem", { lineHeight: "2rem", fontWeight: "700" }],            // 24px
"h1": ["1.5rem", { lineHeight: "2rem", fontWeight: "700" }],                 // 24px
"h2": ["1.0625rem", { lineHeight: "1.375rem", fontWeight: "600" }],          // 17px
"h3": ["0.875rem", { lineHeight: "1.25rem", fontWeight: "600" }],            // 14px
"h4": ["0.8125rem", { lineHeight: "1.125rem", fontWeight: "600" }],          // 13px
"body-lg": ["0.875rem", { lineHeight: "1.25rem" }],                          // 14px
"small": ["0.75rem", { lineHeight: "1rem" }],                                // 12px
```

## 2. Card Component (`src/components/ui/card.tsx`)

Standardize ALL card variants to use `rounded-2xl` instead of `rounded-xl`, remove `shadow-card` and `shadow-card-hover` and `shadow-strong`, keep only `border` for visual separation:

- `default`: `"rounded-2xl border bg-card text-card-foreground transition-all duration-200"`
- `elevated`: `"rounded-2xl bg-card text-card-foreground border transition-all duration-200"`
- `bordered`: `"rounded-2xl border-2 border-border bg-card text-card-foreground transition-all duration-200 hover:border-primary/30"`
- `gradient-border`: keep rounded logic but use `rounded-2xl`
- `glass`: `"rounded-2xl bg-background/80 backdrop-blur-md border border-border/50 text-card-foreground transition-all duration-200"`
- `highlighted`: `"rounded-2xl border bg-primary/5 ring-2 ring-primary/20 text-card-foreground transition-all duration-200"`
- `muted`: `"rounded-2xl border border-muted bg-muted/30 text-card-foreground transition-all duration-200"`
- `interactive`: `"rounded-2xl border bg-card text-card-foreground transition-all duration-150 cursor-pointer active:scale-[0.98] hover:border-border/80"`

Inner div for gradient-border: change `rounded-[14px]` to `rounded-[14px]` (keep as-is, it's inner).

## 3. Bottom Navigation (`src/components/mobile/BottomNavigation.tsx`)

- Nav container: change `border-t border-border/50` to `border-t border-border` (full opacity separator), remove `shadow-lg`
- Icon size: change `h-5 w-5` to `h-6 w-6` (24px)
- Active indicator: change `w-6 h-0.5` to `w-5 h-0.5` (subtle underline, 2px, rounded) — keep as-is but ensure it's accent colored (already `bg-primary`)
- Inactive icons: already `text-muted-foreground` — correct

## 4. Page Header (`src/components/mobile/PageHeader.tsx`)

The title uses `text-page-title` which after the tailwind scale update will be 24px bold. Already has `font-heading font-bold`. Add `tracking-tight` to the h1 className.

## 5. EventCard — Remove hardcoded colors

Line 177: `"Public"` text — already uses `text-muted-foreground`, OK.
Lines 41-43 in `Events.tsx`: `EVENT_TYPE_LEGEND` uses `text-blue-500`, `text-amber-500`, `text-emerald-500` — replace with `text-info`, `text-warning`, `text-success`.

## 6. Index.tsx — Hardcoded colors & spacing

- Line 329: `bg-success/5 border-success/20` — already tokenized, good.
- Lines 332-346: Still uses `text-success`, `bg-success/10`, `hover:bg-success/10` — these are semantic sport indicators, keep.
- Spacing: change `space-y-4` (line 195) to `space-y-6` for mb-6 rhythm between sections.

## 7. Teams.tsx — Spacing

- Line 163: `space-y-3` → `space-y-6` for section rhythm
- Line 283: card grid `gap-2` → `gap-3`
- Line 325: card grid `gap-2` → `gap-3`

## 8. Events.tsx — Spacing & hardcoded colors

- Line 41-43: Replace `text-blue-500`/`text-amber-500`/`text-emerald-500` with `text-info`/`text-warning`/`text-success`
- Line 206: `space-y-3` is OK for within-section, but add `space-y-4` or keep as compact

## 9. FAB — Remove heavy shadow

Line 29: `shadow-lg` → remove (or use `shadow-sm` for subtle depth). The FAB already has `bg-primary` so it stands out.

## 10. Settings.tsx — Spacing

Line 226: `space-y-4` → `space-y-6` for section rhythm.

## 11. Remaining hardcoded colors (targeted fixes)

- `src/components/events/SwipeableEventCard.tsx` lines 66-68: `bg-green-500/10 text-green-700` → `bg-success/10 text-success`, similar for yellow → warning, red → destructive
- `src/components/events/ConflictWarning.tsx` lines 22-40: `amber-500/30` → `warning/30`, `amber-600` → `warning`, `amber-700` → `warning`
- `src/components/teams/TrainingSessionCard.tsx` line 67: `bg-green-500` → `bg-success`
- `src/components/teams/SessionAttendance.tsx` lines 65, 91, 129: `green-500`/`green-600` → `success`
- `src/pages/NotFound.tsx` lines 15-17: `text-gray-600` → `text-muted-foreground`, `text-blue-500` → `text-primary`
- `src/components/teams/PerformanceLevelsTab.tsx` lines 39-42: `text-amber-600` → `text-warning`, `text-green-600` → `text-success`, `text-blue-600` → `text-info`, `text-gray-600` → `text-muted-foreground`
- `src/pages/InvitationHelp.tsx` lines 170-190: `text-green-500` → `text-success`

## Summary

| Category | Change |
|----------|--------|
| Typography | Increase all semantic sizes: page-title 24px, card-title 17px, body 14px, caption 12px |
| Cards | All variants → rounded-2xl, no shadows, border only |
| Bottom nav | Icons 24px, border-t full opacity, no shadow |
| Spacing | Section gaps → space-y-6, card gaps → gap-3, card padding px-4 py-3 |
| Colors | Replace ~30 hardcoded color instances across 8 files with token equivalents |
| FAB | Remove shadow-lg |
| Icons | Already Lucide throughout — just ensure 20px standard (h-5 w-5) on content icons |

