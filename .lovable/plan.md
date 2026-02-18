
# Event Form Critique & Modernization Plan

## What I See Right Now (Visual Audit)

Looking at the live form screenshot, here are the specific problems in descending order of impact:

---

### Problem 1 — Sport selector is a chaotic wrapping grid, not a pill row
The 6 sport chips **wrap into 3 rows** (Padel/Tennis, Soccer/Basketball, Badminton/Volleyball, then +7). This makes it look like a tag cloud, not a selector. The icon to the left of the chip area is also a weird double-icon (the sport chip has its own emoji AND the row has a Dumbbell icon to its left). The wrapping also creates uneven bottom margins that misalign the separator below it.

**Fix:** Make the sport chips horizontally scrollable in a single row (`overflow-x-auto flex-nowrap`), so they never wrap. Hide the scrollbar. This is how every modern app (Airbnb, Meetup, Strava) handles chip selectors.

---

### Problem 2 — Location input is a bordered box inside a FieldRow — broken paradigm
The `Address or venue name` field renders inside a **`rounded-lg border`** box, while every other field (Title, Description, Date) is a flat ghost input. This completely breaks the visual language of the form — it looks like a different component pasted in.

**Fix:** The `DistrictSelector`/`AddressAutocomplete` must render as a ghost input (`bg-transparent border-0`) consistent with Title and Description. The `MapPin` icon in the FieldRow is the visual anchor — no extra border needed.

---

### Problem 3 — Team row is a full-height bordered Select dropdown — incongruent
The "Team" row uses a large `Select` component that renders a rounded border + "Select" placeholder with a chevron. This is the only field in the form that uses a standard form dropdown, visually it fights everything around it.

**Fix:** The team selector should look like a ghost trigger (text + chevron inline, no border box), consistent with the date row's tap-to-expand pattern.

---

### Problem 4 — Type selector pills are filled/solid blue — too heavy for a tab
The "Training" pill has `bg-primary text-primary-foreground` (solid blue fill). For a form that uses ghost inputs and subtle separators, a **solid filled pill** at the very top is jarring — it commands too much visual weight. This is the first element the eye hits.

**Fix:** Change the selected type pill to use `bg-primary/10 text-primary border-primary/40` (tinted, not filled). Same primary color brand, but lighter — feels like a tab, not a button. This harmonizes with the rest of the form's light aesthetic.

---

### Problem 5 — "Public Event / Free event" rows have inconsistent label weights
"Public Event" uses `font-medium` (bold) while "Free event" also uses `font-medium`. But the descriptions below them ("Visible to all users") are `text-[11px] text-muted-foreground`. This creates a heavy title → tiny description contrast that feels cramped.

**Fix:** Reduce the toggle label to `text-sm` (no font-medium), and bump the description to `text-xs` for a more proportional hierarchy. The Switch on the right gives enough affordance — the label doesn't need to be bold.

---

### Problem 6 — Vertical rhythm is uneven: some rows feel taller
The Sport row is 3 rows tall (chip wrap), Date row is 1 line, Location row has an inner box with padding, Team row has the Select height. This creates extremely variable row heights with no visual rhythm. The user's eye has to re-calibrate between every row.

**Fix:** With the sport chip scroll fix and the location ghost fix, all rows settle into a natural ~44px single-line height, creating a consistent rhythm.

---

### Problem 7 — "More options" chevron link is at the far left, Submit button is flush to the edge
The "More options ↓" link starts from `x=0` (left edge), while all FieldRow content starts at `x=~28px` (after the icon). This creates a misalignment — the link isn't anchored to anything. Similarly the `Create Training` button is a nice full-width pill but has no top breathing room from the "More options" row.

**Fix:** Add `pl-7` to the "More options" trigger, aligning it with the main content column. Add `mt-1` spacing between "More options" and the submit button.

---

### Problem 8 — Dialog title "Create New Event" is generic
The dialog shows "Create New Event" as a static title regardless of which type is selected. This is a missed opportunity for micro-feedback.

**Fix:** Make the title dynamic: "New Training", "New Game", "New Social" — updating reactively when the user taps a type pill. This is the Notion/Linear approach to form identity.

---

## Summary Table

| # | Issue | Where | Fix |
|---|-------|--------|-----|
| 1 | Sport chips wrap into 3 rows | SportQuickSelector | `flex-nowrap overflow-x-auto` single scrollable row |
| 2 | Location has a bordered box inside ghost form | DistrictSelector | Ghost styling — remove inner border |
| 3 | Team uses full Select dropdown | MyTeamSelector row | Ghost trigger inline style |
| 4 | Type pill is solid filled blue | EventTypeSelector | Tinted (`bg-primary/10 text-primary`) not solid |
| 5 | Toggle labels too bold, descriptions too small | UnifiedEventForm | `text-sm` label, `text-xs` description |
| 6 | Uneven row heights | Multiple | Fixed by #1 + #2 above |
| 7 | "More options" misaligned, no breathing room | UnifiedEventForm | `pl-7` + `mt-1` |
| 8 | Static generic dialog title | CreateEventDialog | Dynamic title per event type |

---

## Files Changed

| File | Changes |
|------|---------|
| `src/components/events/SportQuickSelector.tsx` | `flex-nowrap overflow-x-auto` + hide scrollbar — chips never wrap |
| `src/components/events/EventTypeSelector.tsx` | Selected pill style: `bg-primary/10 text-primary border-primary/40` instead of solid |
| `src/components/events/UnifiedEventForm.tsx` | Location ghost style, toggle label sizing, "More options" `pl-7`, `mt-1` button spacing, dynamic title prop |
| `src/components/location/DistrictSelector.tsx` | Expose a `ghost` prop or className pass-through to remove inner border when used in the form |
| `src/components/events/CreateEventDialog.tsx` | Dynamic dialog title based on selected event type (requires lifting type state or passing title down) |

No database changes. No new dependencies.
