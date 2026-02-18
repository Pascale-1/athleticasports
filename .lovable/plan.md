
# Event Creation Form: Remove Match Format + UX/UI Improvements

## Part 1 — Remove "Format de la partie" (Match Format Field)

**File: `src/components/events/UnifiedEventForm.tsx`**

1. Remove the `showMatchFormat` boolean (line 314)
2. Remove the entire `{showMatchFormat && (...)}` block (lines 464–478) inside the Match Details `FormSection`
3. Remove `matchFormat` from the form schema's `handleSubmit` data payload (line 282): `match_format: eventType === 'match' ? values.matchFormat || undefined : undefined` → delete
4. The `matchFormat` field can stay in the Zod schema with no harm (unused); or clean it up for purity

**File: `src/components/events/MatchEventForm.tsx`** (legacy form, less used now that UnifiedEventForm exists)
- Remove `matchFormat` from the form schema, `defaultValues`, `handleSubmit`, and the JSX `<FormField>` block

---

## Part 2 — UX/UI Improvements Across All Event Types

After reading all three forms and the unified form end-to-end, here is what should change and why:

### A. EventTypeSelector — More visual hierarchy

**Current problem**: Three small equal buttons with icon + text. No context. A user who is new doesn't know the difference.

**Fix**: Replace the flat 3-button row with a **3-card grid** where each type card shows:
- Larger icon (16px)
- Type name (bold)
- One-line description from `events.json` (`create.trainingDesc`, `create.meetupDesc`, `create.gameDesc`)
- Active state: filled background with border; Inactive: muted ghost with hover

This is a high-impact first-impression change since it's the first thing the user sees.

**File: `src/components/events/EventTypeSelector.tsx`**

### B. "When" section — Replace the date picker button with a cleaner inline approach

**Current problem**: The date button says "MMM dd" in a tiny truncated span. On mobile this looks cramped. Start time is next to it in a grid but both feel disconnected.

**Fix**: Stack date and time vertically (full width each) instead of a 2-col grid. This gives each field breathing room on mobile and avoids truncation.

**File: `src/components/events/UnifiedEventForm.tsx`**, lines 537–603

### C. "Cost" section — Collapse by default (like description)

**Current problem**: The Cost section is always visible and always open, even for 90%+ of events that are free. It adds visual clutter and scrolling.

**Fix**: Move Cost into the "More options" collapsible section (along with description, participants, recurrence, RSVP deadline, looking for players). This makes the primary form much shorter and cleaner.

**File: `src/components/events/UnifiedEventForm.tsx`**, lines 671–738 (Cost FormSection) → move into the `showMoreOptions` AnimatePresence block

### D. Training form — Add "Intensity" quick selector

**Current state**: Training form has no way to communicate what kind of session it is (light warmup vs. intense competition prep). This is valuable context for participants deciding to RSVP.

**Fix**: Add a simple 3-option pill selector: **Light / Moderate / Intense** (FR: Légère / Modérée / Intense). This maps to a `training_intensity` field. The value is stored in the event `description` prefix or in a new optional metadata field.

**Implementation**: Store as a prefixed description string, e.g., `[Intensive] We'll focus on...` — no DB migration needed. Displayed on the event card as a small badge.

**File**: `src/components/events/UnifiedEventForm.tsx` — add intensity state, show only when `eventType === 'training'`, inside the Event Info section.

### E. Social/Meetup category selector — Visual polish

**Current state**: 6 categories in a `grid-cols-3` with emoji + text. Works but feels basic.

**Fix**: Make selected category card show with a colored left border (accent) + slight background tint. Add a 7th category: `🏃 Activity` (for group runs, yoga sessions, etc. that aren't quite Training/Game but aren't social gatherings either). Update translation keys.

**File: `src/components/events/UnifiedEventForm.tsx`**, `MEETUP_CATEGORIES` constant + grid button styling

### F. Match form — Pickup game mode is confusing

**Current state**: When no team is selected for a "Game", a tiny info text says "Public - Anyone can join." This is subtle and easy to miss. Users creating pickup games don't know they're in a different mode.

**Fix**: When `isPickupGame` is true, show a distinct **blue info banner** at the top of the Match Details section that reads: "Open Game — anyone can find and join this game." This makes the pickup mode feel deliberate and clear.

**File: `src/components/events/UnifiedEventForm.tsx`**, around line 362–376

### G. Submit button — Contextual label

**Current state**: Submit always says "Create Event" (`t('createEvent')`).

**Fix**: Make the label context-aware:
- Training → "Create Training" (`t('form.training.create')`)
- Game → "Create Game" (`t('form.game.create')`)
- Social → "Create Social" (`t('form.meetup.create')`)

**File: `src/components/events/UnifiedEventForm.tsx`**, line 977

### H. More options label — Fix "Add a note" key

**Current state**: Line 774 uses `t('form.addNote', 'Add a note...')` with an inline fallback. The key `form.addNote` doesn't exist in `en/events.json`.

**Fix**: Add `"addNote": "Add a note..."` to the `form` section of `en/events.json` and `fr/events.json`.

---

## Summary of Files Changed

| File | Change |
|------|--------|
| `src/components/events/UnifiedEventForm.tsx` | Remove match format field; move Cost to More Options; add pickup game banner; contextual submit label; date/time stacked layout; training intensity selector |
| `src/components/events/EventTypeSelector.tsx` | Redesign to description cards |
| `src/components/events/MatchEventForm.tsx` | Remove `matchFormat` field (legacy cleanup) |
| `src/i18n/locales/en/events.json` | Add `form.addNote`, `form.training.intensity.*`, `form.meetup.categories.activity` |
| `src/i18n/locales/fr/events.json` | Same additions in French |

---

## Visual Impact Summary

| Before | After |
|--------|-------|
| Type selector: 3 small flat buttons | 3 cards with name + description |
| Date + time crammed in 2-col grid | Stacked full-width for clarity |
| Cost always visible (clutters form) | Hidden in More Options by default |
| Match format field (unused/confusing) | Removed entirely |
| Submit: always "Create Event" | Contextual per type |
| Pickup game mode: tiny hint text | Bold info banner |
| Training: no session context | Light / Moderate / Intense pill |
| Social category: plain grid | Richer selected state |

