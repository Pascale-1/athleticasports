

# Global Typography System Overhaul

Update the design token layer (tailwind config + CSS variables) and key shared components to enforce a consistent typography scale. Most components already use the semantic tokens (`text-page-title`, `text-card-title`, `text-body`, `text-caption`, `text-micro`) so updating the token definitions will cascade automatically.

---

## Files to modify

| File | Changes |
|------|---------|
| `tailwind.config.ts` | Redefine fontSize scale to match new spec |
| `src/index.css` | Add CSS custom properties for text colors; update semantic utility classes |
| `src/components/ui/button.tsx` | Base text to `text-[13px] font-semibold` |
| `src/components/ui/badge.tsx` | Base text to `text-[10px] font-medium` |
| `src/components/ui/card.tsx` | CardTitle to use `text-[14px]`, CardDescription to `text-[13px]` |
| `src/components/ui/input.tsx` | Text size to `text-[13px]` |
| `src/components/ui/textarea.tsx` | Text size to `text-[13px]` |
| `src/components/mobile/BottomNavigation.tsx` | Labels to `text-[10px]` |
| `src/components/mobile/PageHeader.tsx` | Title to `text-[20px]`, subtitle to `text-[12px]` |
| `src/pages/EventDetail.tsx` | Title to `text-[18px]`, section headers to `text-[12px] uppercase tracking-[0.6px]`, metadata to `text-[13px]` |
| `src/components/events/EventCard.tsx` | Already `text-[15px]` title → change to `text-[14px]`, metadata `text-[13px]` already correct |
| `src/components/teams/TeamCard.tsx` | Title to `text-[14px]`, sport ribbon to `text-[12px]` |

---

## 1. tailwind.config.ts — Redefine fontSize tokens

```
"page-title": ["1.25rem", { lineHeight: "1.625rem", fontWeight: "700" }],      // 20px — main screens
"screen-title": ["1.125rem", { lineHeight: "1.5rem", fontWeight: "700" }],     // 18px — inner pages
"card-title": ["0.875rem", { lineHeight: "1.25rem", fontWeight: "600" }],      // 14px — card titles
"section": ["0.75rem", { lineHeight: "1rem", fontWeight: "600" }],             // 12px — section headers
"body": ["0.8125rem", { lineHeight: "1.25rem" }],                              // 13px — body text
"body-sm": ["0.75rem", { lineHeight: "1.0625rem" }],                          // 12px
"caption": ["0.75rem", { lineHeight: "1rem" }],                               // 12px
"micro": ["0.625rem", { lineHeight: "0.875rem" }],                            // 10px — badges, pills
// Legacy aliases updated to match
"display"/"h1": 20px, "h2": 14px, "h3": 13px, "h4": 12px, "body-lg": 13px
```

## 2. src/index.css — Text color CSS variables + utility classes

Add to `:root`:
```css
--text-primary: 220 13% 9%;      /* #111827 */
--text-secondary: 220 9% 26%;    /* #374151 */
--text-muted: 220 5% 46%;        /* #6B7280 */
--text-hint: 220 5% 63%;         /* #9CA3AF */
--text-link: 217 91% 60%;        /* #3B82F6 */
```

Update `--foreground` to match `#111827` (220 13% 9%).
Update `--muted-foreground` to match `#6B7280` (220 5% 46%).

Add dark mode equivalents that invert appropriately.

Update utility classes:
- `.text-subtle` → `color: hsl(var(--text-muted))`
- Add `.text-hint` → `color: hsl(var(--text-hint))`
- Add `.text-link` → `color: hsl(var(--text-link))`

## 3. button.tsx — Base size 13px, font-semibold

Change base cva string: `text-sm font-medium` → `text-[13px] font-semibold`
- `sm` size: keep `text-xs` (matches 12px for small buttons)
- `lg` size: `text-[13px]` (not text-base)

## 4. badge.tsx — 10px font-medium

Update base cva: `text-[11px] font-semibold` → `text-[10px] font-medium`

## 5. card.tsx — CardTitle 14px, CardDescription 13px

- CardTitle: `text-[14px] font-semibold`
- CardDescription: `text-[13px] text-muted-foreground`

## 6. input.tsx + textarea.tsx

Change `text-body` → `text-[13px]`

## 7. BottomNavigation.tsx

Labels: `text-[11px]` → `text-[10px]`

## 8. PageHeader.tsx

Title: `text-page-title` (will now be 20px from token update)
Subtitle: `text-[12px]` with `text-muted-foreground`

## 9. EventDetail.tsx

- Title h1: `text-[22px]` → `text-[18px]`
- Section headers (3 occurrences at lines 493, 531, 543): `text-[13px]` → `text-[12px] uppercase tracking-[0.6px]`
- Badge text already uses `text-xs` which maps to 12px — fine

## 10. EventCard.tsx

- Title: `text-[15px]` → `text-[14px]`

## 11. TeamCard.tsx

- Title: `text-[15px]` → `text-[14px]`
- Sport ribbon: `text-[14px]` → `text-[12px]`
- Description: `text-caption` → already 12px, fine
- Member count: `text-[13px]` stays

