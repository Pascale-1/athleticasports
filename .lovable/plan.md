

# Design System Overhaul — Electric Orange + Typography + Depth

Pure visual token changes. No navigation structure, tabs, or feature changes.

## 1. `src/index.css` — Update color tokens in `:root` and `.dark`

Replace gold primary with electric orange `#FF6B1A` across all three theme blocks:

**`:root` and `.dark` changes:**
- `--background: 240 20% 4%` → `#0D0D14` (deeper blue-black)
- `--card: 240 15% 9%` → `#161620` (elevated surface)
- `--primary: 22 95% 54%` → `#FF6B1A` (electric orange)
- `--primary-light: 22 95% 60%`
- `--primary-dark: 22 95% 47%`
- `--primary-foreground: 0 0% 100%` (white on orange)
- `--foreground: 0 0% 94%` → `#EFEFEF`
- `--text-primary: 0 0% 94%`
- `--text-secondary: 240 5% 55%` → `#8A8A9A` minimum
- `--text-muted: 240 5% 55%`
- `--accent: 22 95% 54%` (same orange for accent)
- `--accent-foreground: 0 0% 100%`
- `--ring: 22 95% 54%`
- `--shadow-colored` values updated to orange tint `rgba(255, 107, 26, 0.15)`
- `--popover: 240 15% 12%` slightly elevated
- `--muted: 240 15% 12%`
- `--border: 240 10% 18%`
- `--input: 240 15% 12%`

Mirror identical changes in `.dark` block.

**`.light` block:** Update primary/accent to orange equivalents:
- `--primary: 22 95% 48%` (slightly darker orange for light bg readability)
- `--primary-dark: 22 95% 40%`
- `--accent: 22 95% 54%`
- Shadow colored → orange tint

## 2. `tailwind.config.ts` — Typography scale increase

Update the `fontSize` entries:
- `"body"`: `0.75rem` → `0.9375rem` (15px) with appropriate line height `1.375rem`
- `"body-sm"`: `0.6875rem` → `0.8125rem` (13px)
- `"body-lg"`: same as body `0.9375rem`
- `"card-title"`: `0.8125rem` → `0.9375rem` (15px) semibold
- `"page-title"`: `1.125rem` → `1.375rem` (22px) bold
- `"screen-title"`: `1rem` → `1.25rem` (20px) bold
- `"section"`: `0.6875rem` → `0.8125rem` (13px) semibold uppercase
- `"caption"`: keep `0.6875rem` → `0.75rem` (12px)
- `"micro"`: keep `0.5625rem` → `0.625rem` (10px)
- Update legacy aliases (h1-h4, display, small) to match new scale

Update `boxShadow`:
- `"card-soft"`: `rgba(0, 0, 0, 0.5)` → `0 2px 8px rgba(0, 0, 0, 0.4)` (subtle depth)

## 3. `src/components/ui/button.tsx` — Enforce button hierarchy

Already uses variants. Verify:
- `default` (primary filled): already `bg-primary text-primary-foreground` — will pick up orange automatically
- `outline`: already `border border-input` — change to `border-primary text-primary` for secondary style
- `ghost`: already text-only — no change needed
- No other variant changes needed; tokens do the work

## 4. `src/components/events/EventCard.tsx` — 3dp orange left border stripe

Update the `TYPE_ACCENT` map and border width:
- Change `border-l-[2px]` → `border-l-[3px]`
- `match: 'border-l-primary'` stays (will be orange now)
- `training: 'border-l-primary'` (unify to orange accent)
- `meetup: 'border-l-primary'`

## 5. `src/components/ui/card.tsx` — Ensure card surface uses tokens

Already uses `bg-card` — will automatically pick up `#161620` from new tokens. No code change needed.

## 6. `src/components/mobile/BottomNavigation.tsx` — Active state orange

Already uses `text-primary` and `bg-primary/10` for active state — will automatically become orange. No code change needed.

## 7. `src/components/ui/badge.tsx` — Default badge uses primary

Already `bg-primary text-white` — will be orange automatically. No change needed.

## 8. `src/components/ui/progress.tsx` — Uses `bg-primary`

Already correct. No change needed.

## Summary of files to edit:
1. `src/index.css` — all color tokens (`:root`, `.dark`, `.light`)
2. `tailwind.config.ts` — typography scale increase
3. `src/components/ui/button.tsx` — outline variant border color
4. `src/components/events/EventCard.tsx` — border width 2px → 3px

