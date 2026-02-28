

# Design System Overhaul — Deep Violet + Warm Gold

Pure visual/token changes. No navigation, tabs, or features modified.

## HSL conversions
- `#7C3AED` → `263 84% 58%` (deep violet — primary/active states)
- `#F59E0B` → `38 92% 50%` (warm gold — CTAs/badges/highlights)
- `#0F0D14` → `260 25% 6%` (background)
- `#1A1625` → `256 22% 12%` (card surface)
- `#F0EEFF` → `249 100% 97%` (text primary)
- `#8B7FA8` → `261 17% 58%` (text secondary)

## Files to edit

### 1. `index.html` — Swap Google Fonts
Replace Montserrat+Inter link with `Plus+Jakarta+Sans:wght@400;500;600;700;800`. Update theme-color meta to `#0F0D14`.

### 2. `tailwind.config.ts` — Font family
Change `heading` and `body` font families to `["Plus Jakarta Sans", "system-ui", "sans-serif"]`.

### 3. `src/index.css` — All color tokens

**`:root` block (lines 9-143):**
- `--background: 260 25% 6%`
- `--foreground: 249 100% 97%`
- `--text-primary: 249 100% 97%`
- `--text-secondary: 261 17% 58%`
- `--text-muted: 261 17% 58%`
- `--text-hint: 261 17% 40%`
- `--text-link: 263 84% 58%`
- `--card: 256 22% 12%`
- `--card-foreground: 249 100% 97%`
- `--popover: 256 22% 15%`
- `--popover-foreground: 249 100% 97%`
- `--primary: 263 84% 58%` (violet — active states, tabs, progress)
- `--primary-light: 263 84% 65%`
- `--primary-dark: 263 84% 50%`
- `--primary-foreground: 0 0% 100%`
- `--primary-subtle: 263 40% 12%`
- `--accent: 38 92% 50%` (gold — CTAs, badges, highlights)
- `--accent-foreground: 0 0% 9%` (dark text on gold)
- `--accent-subtle: 38 30% 10%`
- `--muted: 256 22% 15%`
- `--muted-foreground: 261 17% 58%`
- `--info: 263 84% 58%`
- `--match: 38 92% 50%`
- `--match-foreground: 0 0% 9%`
- `--border: 260 15% 20%`
- `--input: 256 22% 15%`
- `--ring: 263 84% 58%`
- `--shadow-colored: 0 2px 12px rgba(124, 58, 237, 0.15)`
- `--shadow-colored-lg: 0 4px 16px rgba(124, 58, 237, 0.25)`
- Sidebar primary/ring → violet HSL
- Event-match-border → `38 92% 50%` (gold accent stripe)
- Neutrals: shift hues from 240 to 260 for purple tint

Mirror in `.dark` block (lines 147-218).

**`.light` block (lines 222-293):**
- `--primary: 263 84% 50%` (slightly darker violet for light bg)
- `--accent: 38 92% 45%` (slightly darker gold)
- `--accent-foreground: 0 0% 9%`
- Shadow colored → violet tint
- Sidebar primary → violet

### 4. `src/components/ui/button.tsx` — Button hierarchy
- `default` variant: `bg-accent text-accent-foreground` (gold filled, dark label)
- `outline` variant: `border border-primary text-primary` (violet outlined)
- `ghost` variant: `text-muted-foreground` (lavender-gray text only)
- `link` variant: `text-primary` (violet)

### 5. `src/components/ui/card.tsx` — Card styling
- Change all `rounded-[12px]` → `rounded-[14px]`
- Default/elevated variants: remove `shadow-card-soft`, add inline `shadow-[0_2px_12px_rgba(124,58,237,0.15)]`
- No hard borders on default cards

### 6. `src/components/events/EventCard.tsx` — Gold accent stripe
- `TYPE_ACCENT` map: all values → `'border-l-accent'` (gold via accent token)

### 7. `tailwind.config.ts` — Box shadow
- `"card-soft"` → `"0 2px 12px rgba(124, 58, 237, 0.15)"`
- `colored` / `colored-lg` → violet tint rgba

