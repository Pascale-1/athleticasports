
# Fix What's Still Broken in the Modernized Form

## What I See Now (from browser screenshot)

The modernized form IS rendering. The dynamic title, underline tabs, ghost title/description inputs, sport dropdown, opponent in main body, and "Create Game" button all work. But 5 specific things still look wrong:

---

### Problem 1 — Sport row shows a wrong icon (people/dots, not Dumbbell)
The sport `FieldRow` uses `icon={Dumbbell}` in the code, but the rendered icon looks like a connected-nodes icon (likely the `Dumbbell` import got shadowed or the wrong lucide icon is rendering). This needs confirming and fixing.

### Problem 2 — Team row is double-height with a full bordered Select
The Team row renders:
- Line 1: "Your Team" as a label in bold
- Line 2: A full bordered `Select` with a chevron box

This creates a double-height row that fights the ghost aesthetic. The `MyTeamSelector` component wraps a `Select` with its own border that needs to be stripped to a ghost trigger style.

### Problem 3 — Blank gap between Description and Sport section is too large
There's a very large empty gap between the description textarea and the sport dropdown. This is caused by the `SectionDivider` (1px line) being flanked by excessive padding. The gap should be tight — just the 1px line.

### Problem 4 — Opponent row "Enter / Select" pills are misaligned and styled inconsistently
The opponent mode toggle pills ("Enter" / "Select") appear as oval pill buttons that look disconnected from the opponent input below. They should be smaller, subtler, and flush with the ghost input pattern.

### Problem 5 — Excess empty space in description area
The description `FieldRow` has `rows={2}` but the textarea is auto-expanding with extra whitespace padding that makes the gap appear much larger than it is. This causes the visual "dead zone" between description and sport.

---

## What the Fixed Form Will Look Like

```text
┌─────────────────────────────────────┐
│ [Training] [Game] [Social]          │  ← underline tabs
├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
│ ✏️  Nom de la séance...             │
│ 📝  Description (optionnel)...      │
├ ─ ─ ─ ─ section divider ─ ─ ─ ─ ─ ─┤  ← visible 1px line, tight spacing
│ 🏋️  Quel sport ?  ▾                 │  ← Dumbbell icon
│ 👥  Mon équipe ▾  Pickup...         │  ← single-line ghost trigger
│ ⚔️  Adversaire: [nom…]  Entr | Sél  │  ← ghost input + mode pills inline
│     ● Dom  ○ Ext  ○ Neutre          │
├ ─ ─ ─ ─ section divider ─ ─ ─ ─ ─ ─┤
│ 📅  Sélectionner une date           │
│ 📍  Adresse ou lieu...              │
│ 🌐  Événement public  ──────  ●     │
│ €   Gratuit  ──────────────  ○      │
├─────────────────────────────────────┤
│     Plus d'options ⌄                │
│ [      Créer la séance      ]       │
└─────────────────────────────────────┘
```

---

## Precise Fixes

### Fix 1 — Correct the sport icon
In `UnifiedEventForm.tsx` the `FieldRow` for sport uses `icon={Dumbbell}`. The rendered icon is wrong. The `Dumbbell` import is at line 10 from lucide-react. The issue is that the icon renders as a "connected nodes" shape — this is actually the `Dumbbell` from lucide at a very small size (`h-4 w-4`) looking like connected dots. No fix needed here beyond visually confirming — actually checking the screenshot again: the icon IS a dumbbell shape rendered small. This is fine, no change needed.

### Fix 2 — Strip MyTeamSelector to a ghost trigger
The `MyTeamSelector` component wraps `SelectTrigger` with border styling. Looking at the current code, the `SelectTrigger` in `MyTeamSelector.tsx` has `className="border-0 shadow-none bg-transparent px-0 focus:ring-0"` but also likely has an inner wrapper label "Your Team" / "Mon équipe" that renders above the select. The fix: remove the separate label from the row and make it a placeholder inside the `SelectTrigger` itself, so it's a single-line ghost row.

In `UnifiedEventForm.tsx` the team `FieldRow` currently renders `MyTeamSelector` which internally renders a label above the select. The fix: pass `hideLabel={true}` or restructure so the label is the placeholder text, not a separate element.

### Fix 3 — Fix description row padding (eliminate dead zone)
The description `FieldRow` uses `rows={2}` on the textarea. The `FieldRow` has `py-3` padding. The `SectionDivider` between desc and sport also has `my-1`. The large gap is coming from the textarea's `min-h` CSS. Fix: set `rows={1}` on the description textarea and add `min-h-0` to let it be truly compact when empty.

### Fix 4 — Move opponent mode pills inline with the input
Instead of mode pills above the input, put them as a tiny trailing element on the same line: `[ghost input…………… | Entr · Sél]`. This removes the extra vertical space the pills currently take. If the user taps "Sél", the ghost input swaps to a dropdown selector.

### Fix 5 — Remove "Your Team" label from MyTeamSelector FieldRow
The FieldRow for team currently shows the label as a block element above the Select trigger. This needs to move into the `SelectTrigger` placeholder. Update `MyTeamSelector.tsx` to accept a `compact` or `inline` prop that hides the label and shows it only as placeholder text.

---

## Files to Change

| File | Change |
|------|--------|
| `src/components/events/UnifiedEventForm.tsx` | 1) Description `rows={1}`, remove `min-h`. 2) Opponent mode pills moved to trailing inline position. 3) Team FieldRow: pass label as placeholder, not separate label element. |
| `src/components/teams/MyTeamSelector.tsx` | Add `inline` or `hideLabel` prop: when true, suppress the `<Label>` block and only show the value/placeholder in the trigger line. |

No database changes. No new dependencies.
