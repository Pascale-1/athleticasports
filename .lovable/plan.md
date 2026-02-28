

# FORCE Dark Palette — Complete Color System Replacement

Replace the entire color system in `src/index.css` with the dark-first FORCE palette. Update `:root` to be the dark palette (since no theme toggle exists). Update sport accent utilities. Update `tailwind.config.ts` shadow token. Update component hardcoded Tailwind color classes (e.g., `bg-amber-100`, `text-blue-600`) to use design tokens.

---

## Files to modify

| File | Changes |
|------|---------|
| `src/index.css` | Replace `:root` with FORCE dark palette, update `.dark` to match, update sport accent utilities, update shadow utilities |
| `tailwind.config.ts` | Update `card-soft` shadow for dark, update `colored` shadow to lime |
| `src/components/ui/card.tsx` | No changes — already uses `bg-card`, `shadow-card-soft` tokens |
| `src/components/ui/button.tsx` | No changes — already uses `bg-primary text-primary-foreground` |
| `src/components/ui/input.tsx` | Remove `border border-input`, add `border-0`, ensure `bg-background` maps to surface-elevated via new token |
| `src/components/mobile/BottomNavigation.tsx` | Update active state: `text-primary bg-primary/10` already works since `--primary` will be lime. Update inactive: use `text-muted-foreground` (will map to hint). Border color will auto-update. |
| `src/components/teams/TeamMemberCard.tsx` | Replace hardcoded `bg-amber-100 text-amber-800` etc. with token-based classes |
| `src/components/events/EventTemplateSelector.tsx` | Replace hardcoded type colors with token-based |
| `src/components/teams/EventsPreview.tsx` | Replace hardcoded type colors |
| `src/components/events/EventRSVPBar.tsx` | Replace `bg-amber-500/10 text-amber-600` with `bg-warning/10 text-warning` |
| `src/components/events/RSVPDeadlineDisplay.tsx` | Replace hardcoded amber with `warning` token |
| `src/components/onboarding/OnboardingHint.tsx` | Replace hardcoded green/amber with tokens |
| `src/components/teams/GenerateTeamsDialog.tsx` | Replace `text-green-600` with `text-success` |
| `src/components/profile/FoundingMemberBadge.tsx` | Replace hardcoded amber/orange gradient with primary token |
| `src/pages/ConfirmDeletion.tsx` | Replace hardcoded green/amber with success/warning tokens |
| `index.html` | Add `class="dark"` to `<html>` tag to activate dark mode class for any remaining `.dark:` prefixed utilities |

---

## 1. src/index.css — FORCE palette as `:root`

Replace entire `:root` block:

```css
:root {
  /* FORCE Palette — Dark First */
  --background: 0 0% 6%;           /* #0F0F0F */
  --foreground: 0 0% 100%;         /* #FFFFFF */

  /* Text Color Scale */
  --text-primary: 0 0% 100%;       /* #FFFFFF */
  --text-secondary: 0 0% 83%;      /* #D4D4D4 */
  --text-muted: 0 0% 64%;          /* #A3A3A3 */
  --text-hint: 0 0% 32%;           /* #525252 */
  --text-link: 73 100% 50%;        /* #CCFF00 — electric lime */

  /* Card / Surface */
  --card: 0 0% 10%;                /* #1A1A1A */
  --card-foreground: 0 0% 100%;

  /* Popover */
  --popover: 0 0% 14%;             /* #242424 */
  --popover-foreground: 0 0% 100%;

  /* Primary — Electric Lime */
  --primary: 73 100% 50%;          /* #CCFF00 */
  --primary-light: 73 100% 55%;
  --primary-dark: 73 100% 40%;     /* #A3CC00 */
  --primary-foreground: 0 0% 4%;   /* #0A0A0A — dark on lime */

  /* Primary Subtle (tinted bg) */
  --primary-subtle: 73 100% 7%;    /* #1A2400 */

  /* Accent */
  --accent: 0 0% 14%;              /* #242424 — surface-elevated */
  --accent-foreground: 0 0% 100%;

  /* Muted */
  --muted: 0 0% 14%;               /* #242424 */
  --muted-foreground: 0 0% 64%;    /* #A3A3A3 */

  /* Destructive */
  --destructive: 0 84% 60%;        /* #EF4444 */
  --destructive-foreground: 0 0% 100%;

  /* Success */
  --success: 142 71% 45%;          /* #22C55E */
  --success-foreground: 0 0% 100%;

  /* Warning */
  --warning: 45 100% 50%;
  --warning-foreground: 0 0% 6%;

  /* Info */
  --info: 73 100% 50%;             /* same as primary in FORCE */
  --info-foreground: 0 0% 4%;

  /* Match */
  --match: 73 100% 50%;
  --match-foreground: 0 0% 4%;

  /* Border & Input */
  --border: 0 0% 16%;              /* #2A2A2A */
  --input: 0 0% 14%;               /* #242424 — surface-elevated, no visible border */
  --ring: 73 100% 50%;             /* lime focus ring */

  /* Neutrals */
  --neutral-50: 0 0% 10%;
  --neutral-100: 0 0% 12%;
  --neutral-200: 0 0% 16%;
  --neutral-300: 0 0% 20%;
  --neutral-400: 0 0% 32%;
  --neutral-500: 0 0% 45%;
  --neutral-600: 0 0% 60%;
  --neutral-700: 0 0% 75%;
  --neutral-800: 0 0% 85%;
  --neutral-900: 0 0% 95%;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.4);
  --shadow-md: 0 2px 4px -1px rgb(0 0 0 / 0.5);
  --shadow-lg: 0 4px 8px -2px rgb(0 0 0 / 0.5);
  --shadow-xl: 0 8px 16px -4px rgb(0 0 0 / 0.6);
  --shadow-2xl: 0 16px 32px -8px rgb(0 0 0 / 0.7);
  --shadow-colored: 0 4px 12px rgba(204, 255, 0, 0.15);
  --shadow-colored-lg: 0 6px 16px rgba(204, 255, 0, 0.25);

  /* Sidebar */
  --sidebar-background: 0 0% 10%;
  --sidebar-foreground: 0 0% 64%;
  --sidebar-primary: 73 100% 50%;
  --sidebar-primary-foreground: 0 0% 4%;
  --sidebar-accent: 0 0% 14%;
  --sidebar-accent-foreground: 0 0% 100%;
  --sidebar-border: 0 0% 16%;
  --sidebar-ring: 73 100% 50%;

  /* Sport-specific tints */
  --sport-football: 120 33% 8%;    /* #0A1F0A */
  --sport-basketball: 30 100% 6%;  /* #1F1200 */
  --sport-volleyball: 252 50% 8%;  /* #0D0A1F */
  --sport-running: 20 100% 6%;     /* #1F0A00 */
}
```

`.dark` block: identical to `:root` (or remove the block entirely and keep only `:root`).

Update sport accent utilities:
```css
.sport-accent-football { border-left-color: hsl(var(--sport-football)); background-color: hsl(var(--sport-football)); }
.sport-accent-basketball { border-left-color: hsl(var(--sport-basketball)); background-color: hsl(var(--sport-basketball)); }
.sport-accent-volleyball { border-left-color: hsl(var(--sport-volleyball)); background-color: hsl(var(--sport-volleyball)); }
.sport-accent-tennis { border-left-color: hsl(73 100% 50% / 0.15); }
.sport-accent-badminton { border-left-color: hsl(73 100% 50% / 0.15); }
```

Update shadow utilities:
```css
.shadow-colored { box-shadow: 0 4px 12px rgba(204, 255, 0, 0.15); }
.shadow-colored-lg { box-shadow: 0 8px 24px rgba(204, 255, 0, 0.25); }
```

Keep spacing, radius, transitions unchanged.

## 2. tailwind.config.ts — Shadow token update

Update `card-soft` shadow:
```
"card-soft": "0 2px 8px rgba(0, 0, 0, 0.4)"
```

Update `colored` shadows to lime:
```
colored: "0 4px 12px rgba(204, 255, 0, 0.15)"
"colored-lg": "0 6px 16px rgba(204, 255, 0, 0.25)"
```

## 3. index.html — Force dark class

Add `class="dark"` to `<html>` tag so any remaining `dark:` prefixed utilities activate.

## 4. src/components/ui/input.tsx — Borderless dark input

Change: `border border-input bg-background` → `border-0 bg-accent` (maps to surface-elevated #242424)
Placeholder: already uses `placeholder:text-muted-foreground` which will now be #A3A3A3. Change to `placeholder:text-[hsl(var(--text-hint))]` for #525252.

## 5. src/components/teams/TeamMemberCard.tsx — Token-based role badges

Replace hardcoded colors:
```tsx
const roleColors: Record<string, string> = {
  owner: "bg-primary/20 text-primary border-primary/30",
  admin: "bg-accent text-foreground border-border",
  coach: "bg-success/20 text-success border-success/30",
  member: "bg-muted text-muted-foreground border-border",
};
```

## 6. src/components/events/EventTemplateSelector.tsx — Token-based type colors

```tsx
const TYPE_COLORS: Record<EventType, string> = {
  training: "bg-primary/10 text-primary border-primary/20",
  match: "bg-warning/10 text-warning border-warning/20",
  meetup: "bg-success/10 text-success border-success/20",
};
```

## 7. src/components/teams/EventsPreview.tsx — Token-based type colors

Same pattern as EventTemplateSelector above.

## 8. src/components/events/EventRSVPBar.tsx — Warning token

Replace `bg-amber-500/10 text-amber-600 border-amber-500/20` → `bg-warning/10 text-warning border-warning/20`

## 9. src/components/events/RSVPDeadlineDisplay.tsx — Warning token

Replace all `amber-*` references with `warning` token equivalents.

## 10. src/components/onboarding/OnboardingHint.tsx — Token-based variants

```tsx
const variantStyles = {
  info: 'border-primary/30 bg-primary/5',
  success: 'border-success/30 bg-success/5',
  tip: 'border-warning/30 bg-warning/5',
};
const iconVariantStyles = {
  info: 'text-primary',
  success: 'text-success',
  tip: 'text-warning',
};
```

## 11. src/components/teams/GenerateTeamsDialog.tsx

Replace `text-green-600` → `text-success`

## 12. src/components/profile/FoundingMemberBadge.tsx

Replace `from-amber-500/20 to-orange-500/20 border-amber-500/40` → `from-primary/20 to-primary/30 border-primary/40`

## 13. src/pages/ConfirmDeletion.tsx

Replace `bg-green-100 dark:bg-green-900` → `bg-success/10`, `text-green-600 dark:text-green-400` → `text-success`, `bg-amber-100 dark:bg-amber-900` → `bg-warning/10`, `text-amber-600 dark:text-amber-400` → `text-warning`

---

## Summary

| Element | Before | After |
|---------|--------|-------|
| App background | `#FFFFFF` (white) | `#0F0F0F` (near black) |
| Card surface | `#FFFFFF` | `#1A1A1A` |
| Primary color | `#0066FF` (blue) | `#CCFF00` (electric lime) |
| Primary button text | White on blue | Black on lime |
| Text primary | `#111827` | `#FFFFFF` |
| Text muted | `#6B7280` | `#A3A3A3` |
| Text hint | `#9CA3AF` | `#525252` |
| Links | `#3B82F6` (blue) | `#CCFF00` (lime) |
| Borders | `#E5E5E5` | `#2A2A2A` |
| Focus ring | Blue | Lime |
| Card shadow | Light `0.06` opacity | Dark `0.4` opacity |
| Sport accents | Bright colors | Deep tinted backgrounds |
| Hardcoded colors | 18 files with `bg-amber-*` etc. | Token-based (`text-warning`, `text-success`, `text-primary`) |

