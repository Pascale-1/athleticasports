

# Streamline Event Creation Form

## Overview
Reorganize the event creation form to follow a logical field sequence, reduce visual noise from excessive card wrappers, and improve mobile usability by consolidating sections and removing redundancies.

## Changes

### 1. Reorder fields to match mental model
Move Sport and Team selection ABOVE the Title field. This way:
- Match titles auto-generate correctly (user picks teams first, title fills itself)
- The logical flow becomes: **What kind** (type) → **Who** (sport/team) → **What** (title) → **When** → **Where** → **Details**

### 2. Consolidate into 3 clear sections instead of 8 cards
Replace the scattered bordered cards with 3 semantic groups:
- **Essentials** (no card wrapper, just fields): Type, Sport, Team, Title, Date/Time/Duration, Location
- **Match Details** (single card, match-only): Opponent, Home/Away, Format -- all together
- **Options** (single expandable area): Visibility, Description, Participants, Recurrence, RSVP, Looking for Players

### 3. Promote Visibility toggle to essentials
Move the Public/Private switch out of "More options" and place it right after Location. It's a primary decision that affects who sees the event.

### 4. Fix match format placement
Move `matchFormat` into the Opponent card where it semantically belongs, instead of being orphaned inside the participant limit section.

### 5. Remove Cancel button from footer
The dialog already has a close X button. Replace the two-button footer with a single full-width "Create Event" button. This reclaims ~44px of vertical space.

### 6. Increase meetup category text size
Bump category labels from `text-[9px]` to `text-[11px]` and reduce the grid to 2 columns on very small screens so labels remain readable.

### 7. Unify "More options" into a single collapsible section
Instead of individual "+ Add description", "+ Make recurring", "+ Set participant limit" ghost buttons, use a single "More options" collapsible that reveals all optional fields at once. This reduces decision fatigue (one tap vs three).

### 8. Simplify animation approach
Replace per-field AnimatePresence wrappers with a single wrapper around the conditional sections. Use CSS transitions for show/hide instead of framer-motion for simple opacity changes.

## Technical Details

### File: `src/components/events/UnifiedEventForm.tsx`

**Field reordering (lines 325-1004):**
```
Current:  Type → Title → When → Where → Sport → Team → Opponent → More Options → Visibility → LFP → RSVP
Proposed: Type → Sport → Team → Title → When → Where → Visibility → Match Details → Options (collapsed)
```

**Remove card wrappers:** Replace the `p-3 bg-muted/30 rounded-lg border` on When and Where sections with simple `space-y-2` dividers. Keep the card style only for the Match Details group and the Options expansion.

**Consolidate "More options":** Replace the 4 separate ghost button toggles (description, recurrence, participant limit, RSVP) with a single Collapsible component:
```tsx
<Collapsible open={showMoreOptions} onOpenChange={setShowMoreOptions}>
  <CollapsibleTrigger asChild>
    <Button variant="ghost" className="w-full justify-between">
      More options
      <ChevronDown className={cn("h-4 w-4 transition", showMoreOptions && "rotate-180")} />
    </Button>
  </CollapsibleTrigger>
  <CollapsibleContent className="space-y-3 pt-2">
    {/* Description textarea */}
    {/* Participant limit input */}
    {/* Recurrence select */}
    {/* RSVP deadline presets */}
    {/* Looking for Players toggle */}
  </CollapsibleContent>
</Collapsible>
```

**Remove Cancel button (lines 996-1003):** Replace the two-button footer with:
```tsx
<Button type="submit" className="w-full h-10" disabled={isSubmitting}>
  {isSubmitting ? '...' : t('createEvent')}
</Button>
```

**Fix category readability (lines 630-644):** Change `text-[9px]` to `text-[11px]` and adjust button height from `h-10` to `h-9`.

**Reduce animation wrappers:** Remove individual `<AnimatePresence>` wrappers from simple show/hide fields. Keep framer-motion only for the type-dependent sections (sport/team, opponent) that need coordinated enter/exit. Use CSS `transition-all` for the rest.

### File: `src/components/events/EventTypeSelector.tsx`
No changes needed -- this component is well-designed.

### File: `src/components/events/DurationPicker.tsx`
Reduce button `min-w` from `60px` to `48px` and add `text-xs` to match form density.

### Summary of impact
- Estimated scroll reduction: ~30% for match events
- Card count: 8 cards reduced to 2
- Animation wrappers: ~15 reduced to ~4
- Footer height saved: 44px
- Clearer information hierarchy with "Who → What → When → Where" flow

