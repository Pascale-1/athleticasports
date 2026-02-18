
# Revolutionary Event Form Redesign

## What's Wrong Today
The current form is a stack of `bg-muted/30` rounded card sections with icon + uppercase label headers. Each section adds visual weight: padding, background, borders on inputs. The result is dense, misaligned, and visually noisy — like a list of settings rather than a creation experience.

## Design Vision: "Inline Magic" Form

Inspired by Strava, Notion, and Linear — a completely flat, whitespace-driven layout with no card backgrounds. Fields use subtle separators rather than card boxes. Large-tap touch targets, strong typographic hierarchy, and animated micro-transitions make it feel fast and alive.

### Core Design Principles Applied
1. **No background cards** — remove all `bg-muted/30` section boxes. Replace with subtle `border-b` line separators between logical groups.
2. **Floating label inputs** — Title and Description use full-width borderless inputs that feel like a rich text editor.
3. **Icon-anchored rows** — each row has a left-aligned icon column (16px) + content, creating perfect vertical alignment throughout the form.
4. **Pill-based selectors** — Sport, Duration, Intensity use horizontal scrollable chip pills, not dropdowns.
5. **Date/time as a single tappable row** — calendar icon + "Saturday, March 8 · 19:00 · 90 min" in one line, popover expands inline below.
6. **Visibility as an icon toggle row** — no card wrapper, just a clean row with globe/lock icon.
7. **Cost as a smart inline row** — "Free" by default, tap to expand amount + payment link.
8. **"More" as a subtle text link** — not a button, just "More options ↓" at the bottom.

---

## Detailed Layout

```text
┌──────────────────────────────────────┐
│  [Training]  [Game]  [Social]         │  ← pill selector, no border box
├──────────────────────────────────────┤
│  🏃 Football (chip pills scrollable)  │  ← sport row, icon + pills
│  ─────────────────────────────────── │
│  📝  Event title...                   │  ← large ghost input, no border
│  ─────────────────────────────────── │
│  ✏️  Add a note (2-line textarea)      │  ← ghost textarea
│  ─────────────────────────────────── │
│  📅  Sat, Mar 8 · 19:00 · 90 min ›   │  ← tappable date row, expands
│  ─────────────────────────────────── │
│  📍  Address or venue...              │  ← ghost address input
│  ─────────────────────────────────── │
│  👥  Your team (select)               │  ← team row
│  ─────────────────────────────────── │
│  🌐  Public event      [toggle]       │  ← visibility row
│  ─────────────────────────────────── │
│  💶  Free              [toggle]       │  ← cost row, expands when toggled
│  ─────────────────────────────────── │
│  ·  More options                      │  ← subtle text link
└──────────────────────────────────────┘
│  [Create Training]                    │  ← full-width CTA
```

---

## Technical Implementation

### New `FieldRow` component (replaces `FormSection`)
A lightweight row component with a left icon column and right content area — defined outside the render function (no scroll-jump):
```tsx
const FieldRow = ({ icon: Icon, children, separator = true }) => (
  <div className="flex items-start gap-3 py-3">
    <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
    <div className="flex-1 min-w-0">{children}</div>
    {separator && <div className="absolute bottom-0 left-7 right-0 h-px bg-border" />}
  </div>
)
```

### EventTypeSelector — pill redesign
Replace the current 3-column card buttons with compact inline pills:
- Selected: `bg-primary/10 text-primary border border-primary/30 font-semibold`
- Unselected: `text-muted-foreground hover:text-foreground`
- Layout: `flex gap-2` instead of `grid grid-cols-3` — pills are auto-width, horizontally centered

### SportQuickSelector — chip pill row
Replace the `<Select>` dropdown with horizontally scrollable emoji+label chip pills (top 6 sports visible, "+ more" chip opens a popover for the rest). Eliminates the dropdown interaction overhead entirely.

### Date/Time — single collapsed row
Default state: `📅 Sat, Mar 8 · 19:00 · 1h30 ›` — a single tappable row.
Expanded state (in-place): shows a compact date picker + time input + duration pills in a `motion.div` that slides down.

### Title + Description
Remove all wrappers. Use full-width `bg-transparent border-0 focus-visible:ring-0 shadow-none` inputs for a "document editor" feel. Title is `text-base font-medium placeholder:text-muted-foreground/50`. Description is 2-row textarea with same ghost treatment.

### Visibility Row
Clean toggle row without any card:
```
🌐 Public  "Anyone can join"    [switch]
```
or
```
🔒 Private "Team members only" [switch]
```

### Cost Row
Default: shows "Free event" with a toggle. Toggle ON reveals:
- Amount input (€ prefix, inline)
- Per person / Total pills
- Payment link (appears only when amount > 0)

### More Options
Changed from a `Button` to a styled `button` text link: `text-xs text-muted-foreground underline-offset-4 hover:underline`

### Form Container
Remove the outer `space-y-2.5` — replaced with `divide-y divide-border` on the rows container, giving a clean ruled-line separation between each logical group.

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/events/UnifiedEventForm.tsx` | Full visual redesign: remove `FormSection` card backgrounds, introduce `FieldRow` layout, ghost inputs, icon-anchored rows, pill sport selector, collapsed date row, clean cost/visibility rows |
| `src/components/events/EventTypeSelector.tsx` | Redesign from 3-column card grid to compact horizontal pill tabs |
| `src/components/events/SportQuickSelector.tsx` | Replace `<Select>` dropdown with horizontally scrollable chip pills (top 6 + overflow popover) |
| `src/components/events/DurationPicker.tsx` | Slim down pill styling: `h-7` height, tighter gaps, remove Label wrapper |

No database changes. No new dependencies (framer-motion already installed). No translation changes needed.
