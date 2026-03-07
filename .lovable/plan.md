

# Enable Light Mode with Hardcoded Color Fixes

## Current State
- Dark mode is forced via `forcedTheme="dark"` in `App.tsx` (line 242).
- Light mode CSS variables are already fully defined in `src/index.css` (`.light` block) — they look correct.
- The `ThemeToggle` component exists but is **not rendered anywhere** in the app.
- Several files use **hardcoded dark-mode colors** that will be invisible or ugly in light mode.

## Changes

### 1. Enable Theme Switching (`src/App.tsx`)
Remove `forcedTheme="dark"` from the ThemeProvider so users can switch themes. Keep `defaultTheme="dark"`.

### 2. Add ThemeToggle to Settings (`src/components/settings/ProfileTabs.tsx`)
Render the existing `<ThemeToggle />` component inside the Settings/Preferences tab so users can switch between System, Light, and Dark.

### 3. Fix Hardcoded Dark-Mode Colors

| File | Issue | Fix |
|------|-------|-----|
| `src/components/events/UnifiedEventForm.tsx` | `bg-[#1A1E26]` on inputs (lines 1007, 1191) | Replace with `bg-popover` or `bg-input` |
| `src/pages/Auth.tsx` | `text-[#F1F5F9]` (line 345), `text-[#64748B]` (line 309), `text-[#38BDF8]` (line 307) | Replace with `text-foreground`, `text-muted-foreground`, `text-primary` |
| `src/pages/ChooseUsername.tsx` | `placeholder:text-[#64748B]` (line 135) | Replace with `placeholder:text-muted-foreground` |
| `src/pages/EventDetail.tsx` | `bg-[rgba(167,139,250,0.10)]`, `text-[#A78BFA]` (lines 520, 525, 551-552) | Replace with semantic classes using CSS variables |
| `src/components/events/EventCard.tsx` | Hardcoded `text-[#CBD5E1]`, `text-[#A78BFA]`, `text-[#16A34A]`, `bg-[rgba(...)]` (lines 40-43, 104, 290) | Replace with theme-aware equivalents using Tailwind `dark:` variants or semantic tokens |

### 4. Add i18n Keys for Theme Labels
Add missing `settings.themeSystem`, `settings.themeLight`, `settings.themeDark` to `en/common.json` and `fr/common.json` if not already present.

## What Won't Change
- Light mode CSS variables — already well-defined.
- The overall design system — just swapping hardcoded hex values for semantic Tailwind tokens.
- No database changes needed.

