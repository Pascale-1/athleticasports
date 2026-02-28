

# Momentum Palette — Complete Color System Replacement

Replace Ignite (Deep Navy + Electric Orange) with Momentum (Deep Plum + Electric Citrus on Warm Cream). Update all CSS variables and shadow tints. Fix the `accent-foreground` token mapping (was white, now plum). Update tailwind shadow tokens.

Also fix French typo: "Rechercher des équipes..." is actually already correct in the JSON. Will verify if there's a different display issue.

---

## Files to modify (3 files)

### 1. `src/index.css` — Replace `:root` + `.dark` with Momentum palette

```css
:root {
  /* MOMENTUM Palette — Deep Plum + Electric Citrus */
  --background: 30 14% 96%;         /* #F7F5F2 — warm cream */
  --foreground: 270 30% 8%;         /* #120D1A */

  --text-primary: 270 30% 8%;       /* #120D1A */
  --text-secondary: 220 9% 26%;     /* #374151 */
  --text-muted: 220 5% 46%;         /* #6B7280 */
  --text-hint: 220 5% 63%;          /* #9CA3AF */
  --text-link: 268 60% 27%;         /* #3D1A6E */

  --card: 0 0% 100%;                /* #FFFFFF */
  --card-foreground: 270 30% 8%;

  --popover: 280 6% 94%;            /* #F0EEF0 */
  --popover-foreground: 270 30% 8%;

  --primary: 268 60% 27%;           /* #3D1A6E — deep plum */
  --primary-light: 268 60% 32%;
  --primary-dark: 268 60% 20%;      /* #2E1254 */
  --primary-foreground: 0 0% 100%;  /* white on plum */

  --primary-subtle: 268 44% 94%;    /* #EDE8F7 */

  --accent: 72 100% 47%;            /* #C8F000 — electric citrus */
  --accent-foreground: 268 60% 27%; /* #3D1A6E — plum text ON citrus */

  --accent-subtle: 72 91% 92%;      /* #F5FDD6 */

  --muted: 280 6% 94%;              /* #F0EEF0 */
  --muted-foreground: 220 5% 46%;   /* #6B7280 */

  --destructive: 0 72% 51%;         /* #DC2626 */
  --destructive-foreground: 0 0% 100%;

  --success: 142 64% 37%;           /* #16A34A */
  --success-foreground: 0 0% 100%;

  --warning: 72 100% 47%;           /* same as accent for Momentum */
  --warning-foreground: 268 60% 27%;

  --info: 268 60% 27%;              /* same as primary */
  --info-foreground: 0 0% 100%;

  --match: 72 100% 47%;
  --match-foreground: 268 60% 27%;

  --border: 270 10% 92%;            /* #E9E5EE */
  --input: 280 6% 94%;              /* #F0EEF0 */
  --ring: 268 60% 27%;              /* plum focus ring */

  /* Neutrals — plum-tinted */
  --neutral-50: 30 14% 96%;
  --neutral-100: 280 6% 94%;
  --neutral-200: 270 10% 92%;
  --neutral-300: 270 8% 85%;
  --neutral-400: 220 5% 63%;
  --neutral-500: 220 5% 46%;
  --neutral-600: 220 9% 26%;
  --neutral-700: 270 30% 8%;
  --neutral-800: 270 30% 5%;
  --neutral-900: 270 30% 3%;

  /* Shadows — plum-tinted */
  --shadow-sm: 0 1px 2px 0 rgb(61 26 110 / 0.04);
  --shadow-md: 0 1px 4px rgba(61, 26, 110, 0.08);
  --shadow-lg: 0 4px 8px -2px rgb(61 26 110 / 0.08);
  --shadow-xl: 0 8px 16px -4px rgb(61 26 110 / 0.1);
  --shadow-2xl: 0 16px 32px -8px rgb(61 26 110 / 0.12);
  --shadow-colored: 0 4px 12px rgba(200, 240, 0, 0.15);
  --shadow-colored-lg: 0 6px 16px rgba(200, 240, 0, 0.25);

  /* Sidebar */
  --sidebar-background: 0 0% 100%;
  --sidebar-foreground: 220 5% 46%;
  --sidebar-primary: 268 60% 27%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 280 6% 94%;
  --sidebar-accent-foreground: 270 30% 8%;
  --sidebar-border: 270 10% 92%;
  --sidebar-ring: 268 60% 27%;

  /* Sport tints */
  --sport-football: 130 40% 93%;    /* #EAF5E9 */
  --sport-basketball: 48 96% 89%;   /* #FEF3C7 */
  --sport-volleyball: 268 44% 94%;  /* #EDE8F7 */
  --sport-running: 72 91% 92%;      /* #F5FDD6 */
}
```

`.dark` block: identical to `:root`.

Update sport accent utilities:
```css
.sport-accent-tennis { border-left-color: hsl(268 60% 27% / 0.15); }
.sport-accent-badminton { border-left-color: hsl(268 60% 27% / 0.15); }
```

Update shadow utilities:
```css
.shadow-colored { box-shadow: 0 4px 12px rgba(200, 240, 0, 0.15); }
.shadow-colored-lg { box-shadow: 0 6px 16px rgba(200, 240, 0, 0.25); }
```

Comment header: change "IGNITE Palette — Deep Navy + Electric Orange" → "MOMENTUM Palette — Deep Plum + Electric Citrus"

### 2. `tailwind.config.ts` — Shadow tokens

```
"card-soft": "0 1px 4px rgba(61, 26, 110, 0.08)"
colored: "0 4px 12px rgba(200, 240, 0, 0.15)"
"colored-lg": "0 6px 16px rgba(200, 240, 0, 0.25)"
```

### 3. French typo fix — `src/i18n/locales/fr/teams.json`

The search placeholder "Rechercher des équipes..." is already correct (has the 's'). No change needed there. But checking for other potential issues — the file looks clean.

---

## What changes automatically (no file edits needed)

Since all components use design tokens, the following update automatically:
- Primary buttons: plum background, white text
- Active nav tab: plum icon + label + plum-subtle pill
- Accent badges (notification, event counts): citrus background, plum text
- Progress bars using `accent`: now citrus
- Links using `text-link`: now plum
- Card shadows: plum-tinted
- Focus rings: plum
- All `bg-primary/10`, `text-primary`, `bg-accent`, `text-accent-foreground` references

## Summary

| Token | Ignite (before) | Momentum (after) |
|-------|-----------------|-------------------|
| `--background` | `#F8F9FB` cool gray | `#F7F5F2` warm cream |
| `--primary` | `#1B2D4F` navy | `#3D1A6E` deep plum |
| `--accent` | `#F95C00` orange | `#C8F000` electric citrus |
| `--accent-foreground` | `#FFFFFF` white | `#3D1A6E` plum |
| `--border` | `#E5E7EB` gray | `#E9E5EE` plum-tinted |
| `--shadow` tint | navy `rgb(27,45,79)` | plum `rgb(61,26,110)` |
| Sport volleyball | blue tint | plum tint |
| Sport running | orange tint | citrus tint |

