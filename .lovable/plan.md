

# Championship Palette — Complete Color System Replacement

Replace Momentum (Deep Plum + Electric Citrus on Warm Cream) with Championship (Champagne Gold on Matte Black). This is a dark-first palette. Only 3 files need token updates; 1 file needs event accent remapping.

---

## Files to modify (4 files)

### 1. `src/index.css` — Replace `:root` + `.dark` with Championship palette

All HSL values updated to Championship spec:

| Token | Momentum (before) | Championship (after) |
|-------|-------------------|---------------------|
| `--background` | `30 14% 96%` warm cream | `0 0% 4%` #0A0A0A matte black |
| `--foreground` | `270 30% 8%` dark plum | `0 0% 96%` #F5F5F5 light |
| `--card` | `0 0% 100%` white | `0 0% 8%` #141414 surface |
| `--popover` | `280 6% 94%` light plum | `0 0% 12%` #1F1F1F elevated |
| `--primary` | `268 60% 27%` plum | `43 50% 54%` #C9A84C gold |
| `--primary-foreground` | white | `0 0% 4%` black on gold |
| `--accent` | `72 100% 47%` citrus | `43 72% 66%` #E8C46A lighter gold |
| `--accent-foreground` | plum | `0 0% 4%` black on gold |
| `--border` | `270 10% 92%` plum-tint | `0 0% 16%` #2A2A2A |
| `--input` | `280 6% 94%` | `0 0% 12%` #1F1F1F |
| `--muted` | `280 6% 94%` | `0 0% 12%` #1F1F1F |
| `--muted-foreground` | `220 5% 46%` | `0 0% 64%` #A3A3A3 |
| `--destructive` | `0 72% 51%` | `0 84% 60%` #EF4444 |
| `--success` | `142 64% 37%` | `142 71% 45%` #22C55E |

Sport tints become dark versions. Shadows become pure black rgba. Shadow utilities updated.

`.dark` block: identical to `:root` (dark-first system).

### 2. `index.html` — Update theme-color meta tag

Change `content="#0080FF"` → `content="#0A0A0A"` to match dark background.

### 3. `tailwind.config.ts` — Shadow tokens

```
"card-soft": "0 2px 8px rgba(0, 0, 0, 0.5)"
colored: "0 4px 12px rgba(201, 168, 76, 0.15)"
"colored-lg": "0 6px 16px rgba(201, 168, 76, 0.25)"
```

### 4. `src/components/events/EventCard.tsx` — Event accent remapping

Championship spec changes event type → border mapping:
```typescript
const TYPE_ACCENT: Record<string, string> = {
  match: 'border-l-primary',    // gold
  training: 'border-l-success', // green
  meetup: 'border-l-accent',    // lighter gold
};
```

Also update tinted background classes to match new mapping.

---

## What changes automatically (no edits needed)

All components using design tokens inherit Championship automatically:
- Primary buttons: gold background, black text
- Nav active tab: gold icon/label + gold-subtle pill
- Notification badge: gold bg, black text
- Cards: dark surface, black shadow
- Inputs: dark elevated surface
- Focus rings: gold
- All `bg-primary`, `text-primary`, `bg-accent` references

