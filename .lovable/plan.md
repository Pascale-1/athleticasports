

# Ignite Palette — Complete Color System Replacement

Replace the FORCE dark palette with the Ignite light palette (Deep Navy + Electric Orange). Update all CSS variables, shadows, sport tints, and replace remaining hardcoded color classes across 14 files.

---

## Files to modify

| File | Changes |
|------|---------|
| `src/index.css` | Replace `:root` + `.dark` with Ignite palette, update sport accents, shadow utilities |
| `index.html` | Remove `class="dark"` from `<html>` tag |
| `tailwind.config.ts` | Update `card-soft` shadow, `colored` shadows to navy-tinted |
| `src/components/ui/button.tsx` | Add `rounded-full` to all sizes for pill buttons |
| `src/components/ui/card.tsx` | Update border-radius to 12px |
| `src/components/teams/TeamHeader.tsx` | Replace hardcoded purple/blue/green role colors with tokens |
| `src/components/teams/InlineInvitationCards.tsx` | Replace all `amber-*` with `warning` tokens |
| `src/components/events/EventPreviewCard.tsx` | Replace `amber-500` and `green-500` with tokens |
| `src/components/settings/AccountDangerZone.tsx` | Replace `green-*` with `success` tokens |
| `src/components/onboarding/CompletionStep.tsx` | Replace `green-500`, `amber-*`, `orange-*` with tokens |
| `src/components/feedback/FeedbackForm.tsx` | Replace `yellow-500`, `blue-500`, `green-500` with tokens |
| `src/components/ui/avatar.tsx` | Replace `bg-green-500` with `bg-success` |
| `src/pages/AcceptInvitation.tsx` | Replace `text-green-500` with `text-success` |
| `src/components/ui/sonner.tsx` | Add 3px left accent border in accent color |

---

## 1. `src/index.css` — Ignite palette

Replace entire `:root` block with:

```css
:root {
  --background: 220 20% 97%;        /* #F8F9FB */
  --foreground: 216 43% 11%;        /* #0F1B2D */
  --text-primary: 216 43% 11%;      /* #0F1B2D */
  --text-secondary: 220 9% 26%;     /* #374151 */
  --text-muted: 220 5% 46%;         /* #6B7280 */
  --text-hint: 220 5% 63%;          /* #9CA3AF */
  --text-link: 217 53% 21%;         /* #1B2D4F */
  --card: 0 0% 100%;                /* #FFFFFF */
  --card-foreground: 216 43% 11%;
  --popover: 220 16% 96%;           /* #F1F3F7 */
  --popover-foreground: 216 43% 11%;
  --primary: 217 53% 21%;           /* #1B2D4F — deep navy */
  --primary-light: 217 53% 25%;
  --primary-dark: 217 53% 17%;      /* #152340 */
  --primary-foreground: 0 0% 100%;  /* white on navy */
  --primary-subtle: 218 56% 95%;    /* #EBF0F8 */
  --accent: 22 100% 49%;            /* #F95C00 — electric orange */
  --accent-foreground: 0 0% 100%;
  --muted: 220 16% 96%;             /* #F1F3F7 */
  --muted-foreground: 220 5% 46%;   /* #6B7280 */
  --destructive: 0 84% 60%;         /* #EF4444 */
  --destructive-foreground: 0 0% 100%;
  --success: 142 64% 37%;           /* #16A34A */
  --success-foreground: 0 0% 100%;
  --warning: 22 100% 49%;           /* same as accent */
  --warning-foreground: 0 0% 100%;
  --info: 217 53% 21%;              /* same as primary */
  --info-foreground: 0 0% 100%;
  --match: 22 100% 49%;
  --match-foreground: 0 0% 100%;
  --border: 220 13% 91%;            /* #E5E7EB */
  --input: 220 16% 96%;             /* #F1F3F7 */
  --ring: 217 53% 21%;              /* navy focus */
  --neutral-50: 220 20% 97%;
  --neutral-100: 220 16% 96%;
  --neutral-200: 220 13% 91%;
  --neutral-300: 220 11% 85%;
  --neutral-400: 220 5% 63%;
  --neutral-500: 220 5% 46%;
  --neutral-600: 220 9% 26%;
  --neutral-700: 216 43% 11%;
  --neutral-800: 216 43% 7%;
  --neutral-900: 216 43% 4%;
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(27 45 79 / 0.04);
  --shadow-md: 0 1px 4px rgba(27, 45, 79, 0.08);
  --shadow-lg: 0 4px 8px -2px rgb(27 45 79 / 0.08);
  --shadow-xl: 0 8px 16px -4px rgb(27 45 79 / 0.1);
  --shadow-2xl: 0 16px 32px -8px rgb(27 45 79 / 0.12);
  --shadow-colored: 0 4px 12px rgba(249, 92, 0, 0.12);
  --shadow-colored-lg: 0 6px 16px rgba(249, 92, 0, 0.2);
  /* Sidebar */
  --sidebar-background: 0 0% 100%;
  --sidebar-foreground: 220 5% 46%;
  --sidebar-primary: 217 53% 21%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 220 16% 96%;
  --sidebar-accent-foreground: 216 43% 11%;
  --sidebar-border: 220 13% 91%;
  --sidebar-ring: 217 53% 21%;
  /* Sport tints */
  --sport-football: 142 76% 90%;    /* #DCFCE7 */
  --sport-basketball: 48 96% 89%;   /* #FEF3C7 */
  --sport-volleyball: 218 56% 95%;  /* #EBF0F8 */
  --sport-running: 28 97% 95%;      /* #FEF0E6 */
}
```

`.dark` block: same as `:root` (light-first, no dark mode variant needed).

Update sport accent utilities to use warm tints. Update shadow utilities to orange-tinted.

## 2. `index.html` — Remove dark class

Change `<html lang="en" class="dark">` → `<html lang="en">`

## 3. `tailwind.config.ts` — Shadow updates

```
"card-soft": "0 1px 4px rgba(27, 45, 79, 0.08)"
colored: "0 4px 12px rgba(249, 92, 0, 0.12)"
"colored-lg": "0 6px 16px rgba(249, 92, 0, 0.2)"
```

Update `borderRadius.lg` to `"0.75rem"` (12px for cards).

## 4. `button.tsx` — Pill buttons

Add `rounded-full` to base cva string (border-radius 999px).

## 5. `card.tsx` — 12px radius

Change all `rounded-[10px]` → `rounded-xl` (maps to 16px, but override config lg=12px so use `rounded-[12px]`).

## 6-14. Hardcoded color replacements

| File | Before | After |
|------|--------|-------|
| `TeamHeader.tsx` | `bg-purple-100 text-purple-800...` | `bg-warning/20 text-warning` (owner), `bg-primary/10 text-primary` (admin), `bg-success/20 text-success` (coach) |
| `InlineInvitationCards.tsx` | All `amber-*` | `warning` tokens |
| `EventPreviewCard.tsx` | `bg-amber-500/10 text-amber-500` | `bg-warning/10 text-warning`; `bg-green-500/10 text-green-500` → `bg-success/10 text-success` |
| `AccountDangerZone.tsx` | All `green-*` | `success` tokens |
| `CompletionStep.tsx` | `bg-green-500/10 text-green-500` → `bg-success/10 text-success`; `amber-*/orange-*` → `bg-accent/10 text-accent` |
| `FeedbackForm.tsx` | `text-yellow-500` → `text-warning`, `text-blue-500` → `text-primary`, `text-green-500` → `text-success` |
| `avatar.tsx` | `bg-green-500` → `bg-success` |
| `AcceptInvitation.tsx` | `text-green-500` → `text-success` |
| `sonner.tsx` | Add `border-l-[3px] border-l-accent` to toast class |

