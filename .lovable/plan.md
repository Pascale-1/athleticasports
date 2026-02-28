

# Color Palette Replacement — Sky Blue Athletic Theme

HSL conversions for new palette:
- `#080A0F` → `220 31% 5%` (background)
- `#111318` → `220 18% 8%` (surface/card)
- `#1A1E26` → `218 20% 13%` (elevated surface)
- `#38BDF8` → `199 89% 60%` (primary sky blue)
- `#0EA5E9` → `199 89% 48%` (accent hover)
- `#CBD5E1` → `215 20% 84%` (highlight silver)
- `#34D399` → `160 64% 52%` (success)
- `#F87171` → `0 91% 71%` (danger/destructive)
- `#F1F5F9` → `210 40% 96%` (primary text)
- `#64748B` → `215 16% 47%` (secondary text)
- `#334155` → `217 23% 27%` (muted/placeholder)

## Files to edit

### 1. `src/index.css` — All color tokens

Replace `:root` and `.dark` blocks with new palette. Key mappings:

| Token | New HSL |
|---|---|
| `--background` | `220 31% 5%` |
| `--foreground` | `210 40% 96%` |
| `--text-primary` | `210 40% 96%` |
| `--text-secondary` | `215 16% 47%` |
| `--text-muted` | `215 16% 47%` |
| `--text-hint` | `217 23% 27%` |
| `--text-link` | `199 89% 60%` |
| `--card` | `220 18% 8%` |
| `--card-foreground` | `210 40% 96%` |
| `--popover` | `218 20% 13%` |
| `--popover-foreground` | `210 40% 96%` |
| `--primary` | `199 89% 60%` |
| `--primary-light` | `199 89% 65%` |
| `--primary-dark` | `199 89% 48%` |
| `--primary-foreground` | `220 31% 5%` |
| `--primary-subtle` | `199 30% 10%` |
| `--accent` | `199 89% 60%` |
| `--accent-foreground` | `220 31% 5%` |
| `--accent-subtle` | `199 20% 10%` |
| `--muted` | `217 23% 27%` |
| `--muted-foreground` | `215 16% 47%` |
| `--destructive` | `0 91% 71%` |
| `--success` | `160 64% 52%` |
| `--warning` | `199 89% 60%` |
| `--info` | `199 89% 60%` |
| `--match` | `199 89% 60%` |
| `--match-foreground` | `220 31% 5%` |
| `--border` | `220 10% 16%` |
| `--input` | `220 18% 8%` |
| `--ring` | `199 89% 60%` |
| Shadows | `rgba(56, 189, 248, 0.10)` tint |
| Sidebar tokens | Same sky blue mappings |
| Sport tints | Cool-toned slate variants |
| Event borders | All → `199 89% 60%` |

`.light` block: map primary/accent to slightly darker sky `199 89% 48%`, backgrounds to light slate equivalents.

Shadow utilities (`.shadow-colored`, `.shadow-colored-lg`): replace violet rgba with `rgba(56, 189, 248, 0.10)` and `rgba(56, 189, 248, 0.18)`.

Sport accent classes (`.sport-accent-tennis`, `.sport-accent-badminton`): replace violet hsl with sky blue.

### 2. `tailwind.config.ts` — Box shadows

Update `card-soft`, `colored`, `colored-lg` to use `rgba(56, 189, 248, 0.10)` instead of violet rgba.

### 3. `src/components/ui/card.tsx` — Card shadow color

Replace all `rgba(124,58,237,0.15)` inline shadows with `rgba(56,189,248,0.10)`.

### 4. `src/components/ui/button.tsx` — Already uses tokens

`default` variant uses `bg-accent text-accent-foreground` — will pick up sky blue automatically. `outline` uses `border-primary text-primary` — will become sky blue. No code change needed.

### 5. `index.html` — Theme color meta

Update `<meta name="theme-color"` to `#080A0F`.

