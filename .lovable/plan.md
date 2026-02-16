

# Revamp Event Creation Form - Modern, Clean Layout

## Overview

Redesign the event creation form with a modern, card-based layout that groups related fields into visually distinct sections, improves scannability, and moves the Public/Private toggle into the essential (always-visible) fields.

## Current Issues
- The form is a flat list of fields with no visual grouping -- everything runs together
- Labels are tiny and sparse; sections blur into each other
- The Public/Private toggle is buried in "More options"
- The "When" and "Where" sections have labels but no visual container to group them
- The Tarif section looks disconnected
- "More options" collapses many important fields behind an unlabeled accordion

## Proposed Design

### Visual Structure: Grouped Sections in Soft Cards

Each logical group of fields gets wrapped in a subtle card container (`bg-muted/30 rounded-xl p-3`) with a section header icon + label. This creates visual breathing room and clear hierarchy.

```text
+------------------------------------------+
| [Event Type Selector - pill/tab bar]     |
+------------------------------------------+

+-- Sport & Team -------------------------+
| Sport dropdown   |   Team dropdown       |
| [pickup hint if applicable]             |
+-----------------------------------------+

+-- Match Details (conditional) ----------+
| Opponent: [select/manual]               |
| Home / Away / Neutral                   |
| Format: [input]                         |
+-----------------------------------------+

+-- Event Info ----------------------------+
| Title: [input]                          |
| Public / Private  [toggle row]          |
+-----------------------------------------+

+-- When ----------------------------------+
| Date [picker]  |  Time [picker]         |
| Duration: [1h] [1h30] [2h] [custom]    |
+-----------------------------------------+

+-- Where ---------------------------------+
| [Physical/Virtual/Hybrid] (meetup only) |
| Location: [district selector]           |
+-----------------------------------------+

+-- Cost ----------------------------------+
| [Free toggle]                           |
| EUR [amount]    [Total | /pers.]        |
| Payment link (if cost > 0)              |
+-----------------------------------------+

+-- More options (collapsible) ------------+
| + Add a note...                         |
| Max participants         [--]           |
| Repeat                   [None v]       |
| RSVP Deadline            [toggle]       |
| Looking for players      [toggle]       |
+-----------------------------------------+

      [ Create Event ]
```

### Key Changes

1. **Section Cards**: Wrap each group (Sport/Team, Event Info, When, Where, Cost, More Options) in a soft `bg-muted/30 rounded-xl p-3 space-y-2` container. Each has a small icon + bold label header.

2. **Public/Private Toggle Moved to Essentials**: Place the visibility toggle in the "Event Info" card right below the title, always visible (not inside "More options"). For match events, it stays auto-determined based on team selection.

3. **Cleaner Event Type Selector**: Keep the existing 3-col pill bar but remove the description text below it (saves vertical space; the icons + labels are self-explanatory).

4. **Consistent Field Heights**: All inputs use `h-10` instead of mixed `h-8`/`h-9` for a uniform feel.

5. **Section Headers**: Each card gets a small header with icon + label in `text-xs font-semibold text-muted-foreground uppercase tracking-wider` style for a modern sectioned feel.

## Technical Changes

### File: `src/components/events/UnifiedEventForm.tsx`

- **Add a `FormSection` helper component** inside the file:
  - Props: `icon`, `title`, `children`, optional `className`
  - Renders: `div` with `bg-muted/30 rounded-xl p-3 space-y-2.5` containing a header row and children

- **Move visibility toggle** (lines 758-784) from "More Options" into the essentials section, right after the Title field. Wrap both in a "Event Info" FormSection.

- **Wrap existing field groups** in FormSection:
  - Sport + Team fields -> "Sport & Team" section (only when `showSportSelector || showTeamSelector`)
  - Match-specific fields (opponent, home/away, format) -> "Match Details" section
  - Title + Visibility -> "Event Info" section  
  - Date/Time/Duration -> "When" section (already has label, just wrap in card)
  - Location fields -> "Where" section (already has label, just wrap in card)
  - Cost fields -> "Cost" section (already has label, just wrap in card)
  - Remaining "More Options" fields stay in their collapsible section

- **Remove event type description** (`<p>` tag on line 51-53 in EventTypeSelector) to reduce clutter.

- **Standardize input heights** to `h-10` across all fields in the form.

### File: `src/components/events/EventTypeSelector.tsx`

- Remove the description `<p>` tag (lines 51-53) for a cleaner look.
- Slightly increase the pill height from `h-11` to `h-12` for better tap targets.

### File: `src/components/events/DurationPicker.tsx`

- Increase button heights from default to `h-9` for consistency.

### No database or i18n changes needed

This is purely a UI/layout refactor -- all data flow, state management, and submission logic remain identical.

## Summary of Visible Improvements
- Clear visual grouping with soft card containers
- Public/Private always visible in essentials
- Event type description removed (cleaner)
- Consistent field sizing
- Modern "section card" aesthetic matching the app's design language
- Better mobile scannability with clear section boundaries

