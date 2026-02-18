
# Form Polish: Harmonize Layout, Typography & Visual Consistency

## Critique of the Current Form

After reading all the code, here are the concrete issues causing the "weird" feeling:

### 1. Mixed input paradigms — jarring inconsistency
The form mixes 3 different input styles with no clear rule:
- Ghost/borderless `<input>` (Title, Description, payment link, virtual URL)
- Styled `<Input>` component with border + height (cost amount `h-8`, max participants `h-8`, recurrence end date `h-8`)
- Native `<input type="time">` with no border or casing (looks broken next to the duration pills)

**Fix:** Standardize. Ghost inputs only for Title & Description (text area feel). All other inputs use the same compact bordered style (`h-9`). The `<input type="time">` needs a visible container/border to feel intentional.

### 2. `FieldRow` icon misalignment
The icon sits at `mt-0.5` (`items-start`), which pushes it down slightly. For single-line rows (Visibility, Cost), this creates a slight misalignment between the icon and the text. For multi-content rows it's inconsistent.

**Fix:** Use `items-center` for rows with only a single line of content (Visibility, Cost header). Keep `items-start` for rows that expand (Sport, Description, Location). The cleanest solution: always `items-start` but standardize `mt-0.5` consistently per icon.

### 3. Type selector — orphaned border
`EventTypeSelector` has `pb-3 border-b` as its own bottom border, then the `divide-y divide-border` div below starts. This creates a double-border gap at the top — the first separator is taller/heavier than the rest.

**Fix:** Remove the `border-b` from `EventTypeSelector` and let it live inside the `divide-y` container like all other rows. Or add a consistent `pt-3` to the first row so the spacing is balanced.

### 4. Cost row — toggle logic is inverted and confusing
The switch is `checked={!isFree}`. Default state is `isFree = false`, so the switch is ON by default even though the default label says "Cost". This is semantically backwards — the user expects to toggle FROM free TO paid, not the other way.

**Fix:** Rename the state to `hasCost` (boolean, default `false`). Switch is `checked={hasCost}`. Label shows "Free" when off, toggles to show the cost inputs when on. Much more natural.

### 5. Date row — time input looks broken
After selecting a date, the time `<input type="time">` appears inline with no border, sitting next to duration pills. There's no visual container — the time just floats. The `·` separator is positioned oddly.

**Fix:** Wrap the time + duration sub-row in a small `rounded-lg border border-border bg-muted/30 px-3 py-1.5` pill-container, making it a cohesive secondary row under the date summary. This mirrors how Linear/Notion handle date detail rows.

### 6. Submit button — loading state shows just `...`
When `isSubmitting`, the button renders `...` — no spinner, no localized text. This looks unfinished.

**Fix:** Add a small inline spinner (a simple `animate-spin` border div or Loader2 icon) and show `t('form.creating')` text alongside it.

### 7. "More options" section — inconsistent interior padding
Inside the expanded "More options", the items use `py-2.5` with a `pl-6` indent for sub-items. But the indent doesn't align with the main `FieldRow` icon column (which is `gap-3` = 12px icon + 12px gap = 24px left offset). The `pl-6` (24px) is close but the expanded sections start from the edge (no `gap-3` offset), so they look shifted.

**Fix:** Add a `pl-7` (28px, matching icon width 16px + gap 12px) to the interior of "More options" rows, so sub-items align with the main content column of the `FieldRow` above them.

### 8. `EventTypeSelector` — active state styling mismatch
Active pills use `bg-primary text-primary-foreground border-primary` (filled, solid blue). Inactive use `border-border text-muted-foreground`. This is fine — but the pills have no gap from the bottom of the dialog header. There's a visual crowding at the top.

**Fix:** Add `mb-1` to the `EventTypeSelector` wrapper for breathing room before the first row.

### 9. Visibility row — description text below label but no visual separation from next row
The two-line text block (title + description) in the Visibility row sits inside `FieldRow` which has `border-b`. The description line uses `text-xs text-muted-foreground`, which is fine, but it has no `mt-0.5` separating it from the title, making the two lines feel jammed together.

**Fix:** Add `mt-0.5` between the title `<p>` and the description `<p>` in the visibility row, and reduce the description font to `text-[11px]` for a better visual hierarchy.

### 10. Sport chip row — no vertical alignment with the Dumbbell icon
The `SportQuickSelector` renders chips that are taller than the icon, so `items-start` is used — but the icon top doesn't match the first chip's vertical center. Visually the icon hangs in an ambiguous position.

**Fix:** For the sport row specifically, change the `FieldRow` icon alignment: wrap icon in `<div className="mt-1">` to align it to the center of the first chip row.

---

## Summary of All Fixes

| # | Problem | Fix |
|---|---------|-----|
| 1 | Mixed input styles | Standardize: ghost for title/notes, bordered `h-9` for all others |
| 2 | FieldRow icon alignment | Consistent `mt-0.5`, use `items-center` on single-line rows |
| 3 | Double border at top | Remove `border-b` from `EventTypeSelector`, absorb into `divide-y` |
| 4 | Cost toggle inverted | Rename to `hasCost`, default `false`, natural ON=paid flow |
| 5 | Time input looks broken | Wrap time+duration in bordered pill container |
| 6 | Submit shows `...` | Replace with Loader2 spinner + localized creating text |
| 7 | "More options" misaligned | `pl-7` on interior items to align with content column |
| 8 | Type selector crowding | Add `mb-1` breathing room after EventTypeSelector |
| 9 | Visibility row text jammed | `mt-0.5` + `text-[11px]` on description sub-line |
| 10 | Sport icon float | `mt-1` wrapper on Dumbbell icon in sport row |

---

## Files to Change

| File | Changes |
|------|---------|
| `src/components/events/UnifiedEventForm.tsx` | Fixes #1 #2 #4 #5 #6 #7 #9 #10 — the bulk of the polish |
| `src/components/events/EventTypeSelector.tsx` | Fix #3 + #8 — remove border-b, add mb-1 |

No database, schema, or translation changes needed.
