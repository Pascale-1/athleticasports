

# Light Mode for Championship Palette

Add a complete light mode variant with system preference detection and manual toggle. 4 files to modify, 1 new file.

## Files to modify

### 1. `src/index.css` — Add `.light` class with light mode tokens + event type tokens

Current `:root` stays as dark defaults. Add a new `.light` class block with all light mode overrides:

```css
.light {
  --background: 36 23% 96%;           /* #F8F6F1 */
  --foreground: 24 18% 8%;            /* #1A1410 */
  --text-primary: 24 18% 8%;
  --text-secondary: 18 10% 22%;       /* #3D3530 */
  --text-muted: 24 10% 44%;           /* #7A6F65 */
  --text-hint: 24 7% 62%;             /* #A89F95 */
  --text-link: 36 55% 40%;            /* #9A7230 */
  --card: 0 0% 100%;
  --card-foreground: 24 18% 8%;
  --popover: 36 15% 92%;              /* #F0EDE6 */
  --popover-foreground: 24 18% 8%;
  --primary: 36 55% 40%;              /* #9A7230 */
  --primary-light: 36 55% 45%;
  --primary-dark: 36 55% 32%;         /* #7D5C27 */
  --primary-foreground: 0 0% 100%;    /* white on gold */
  --primary-subtle: 42 85% 93%;       /* #FDF3DC */
  --accent: 43 50% 54%;               /* #C9A84C */
  --accent-foreground: 36 55% 32%;    /* #7D5C27 */
  --accent-subtle: 44 85% 96%;        /* #FDF8EC */
  --muted: 36 15% 92%;
  --muted-foreground: 24 10% 44%;
  --destructive: 0 72% 51%;           /* #DC2626 */
  --destructive-foreground: 0 0% 100%;
  --success: 142 64% 37%;             /* #16A34A */
  --success-foreground: 0 0% 100%;
  --warning: 43 50% 54%;
  --warning-foreground: 36 55% 32%;
  --info: 36 55% 40%;
  --info-foreground: 0 0% 100%;
  --match: 43 50% 54%;
  --match-foreground: 36 55% 32%;
  --border: 33 18% 87%;               /* #E5E0D5 */
  --input: 36 15% 92%;
  --ring: 36 55% 40%;
  /* Lighter neutrals scale */
  --neutral-50 through --neutral-900 (inverted warm scale)
  /* Lighter shadows */
  --shadow-sm/md/lg: rgba(0,0,0,0.04-0.08) range
  /* Light sport tints */
  --sport-football: 120 30% 94%;      /* #EBF5EB */
  --sport-basketball: 40 90% 94%;     /* #FEF6E4 */
  --sport-volleyball: 260 100% 97%;   /* #F3F0FF */
  --sport-running: 28 90% 95%;        /* #FEF0E6 */
  /* Light sidebar */
  --sidebar-background: 0 0% 100%;
  --sidebar-border: 33 18% 87%;
}
```

Also add event-type CSS custom properties to both `:root` (dark) and `.light`:

```css
/* Dark event types (in :root) */
--event-match-bg: 43 30% 9%;
--event-match-border: 43 50% 54%;
--event-training-bg: 140 30% 6%;
--event-training-border: 140 30% 38%;
--event-social-bg: 0 20% 9%;
--event-social-border: 0 20% 58%;
--event-other-bg: 228 20% 8%;
--event-other-border: 218 18% 53%;

/* Light event types (in .light) */
--event-match-bg: 44 85% 96%;
--event-match-border: 43 50% 54%;
--event-training-bg: 130 30% 94%;
--event-training-border: 140 30% 38%;
--event-social-bg: 0 50% 97%;
--event-social-border: 0 20% 58%;
--event-other-bg: 225 30% 95%;
--event-other-border: 218 18% 53%;
```

### 2. `src/App.tsx` — Wrap app with ThemeProvider from next-themes

```tsx
import { ThemeProvider } from "next-themes";
// Wrap everything inside ThemeProvider with attribute="class" defaultTheme="dark" enableSystem
```

### 3. `src/components/settings/ThemeToggle.tsx` — New file

A simple toggle component using `useTheme()` from next-themes. Three options: System / Light / Dark. Uses existing button/dropdown patterns. Renders as a row with sun/moon icons.

### 4. `src/pages/Settings.tsx` — Add ThemeToggle to settings page

Import and render `<ThemeToggle />` inside the settings card area, near the language toggle.

### 5. `index.html` — Update theme-color meta for light mode support

Add a second `<meta name="theme-color" media="(prefers-color-scheme: light)" content="#F8F6F1">` alongside the existing dark one.

## What changes automatically

All components using design tokens (`bg-background`, `bg-card`, `text-foreground`, `text-primary`, `bg-primary`, etc.) will automatically adapt. No per-component changes needed.

