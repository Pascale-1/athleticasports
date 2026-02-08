

# Fix: Text Overflow and Wording Issues Across the App

## Overview

After thorough inspection of the app in both English and French, the following text overflow / "coming out of its boxes" issues have been identified across multiple components. This plan addresses all of them systematically.

---

## Issue 1: EventTypeSelector -- Descriptions Overflow on Small Screens (FR)

**File:** `src/components/events/EventTypeSelector.tsx`

The three event type buttons (`Match`, `Seance`, `Sortie`) are in a `grid-cols-3` with `h-20` height and `px-1`. The French description text like "Course, entrainement ou sport" and "Affrontez un adversaire" overflows on 320px-374px screens.

**Fix:**
- Reduce description text from `text-[9px]` to `text-[8px]` and add `line-clamp-2` for safety
- Add `overflow-hidden` to the button container
- Shorten the French descriptions in `fr/events.json` (`create.trainingDesc`, `create.meetupDesc`, `create.gameDesc`) to be more compact

---

## Issue 2: Meetup Category Grid -- French Labels Overflow Buttons

**File:** `src/components/events/UnifiedEventForm.tsx` (lines 516-533)

The meetup categories (`Watch Party`, `Post-Game Drinks`, `Team Dinner`, etc.) are in a `grid-cols-3` with `h-12` buttons. French translations like "Apero d'apres-match" or "Diner d'equipe" overflow or get truncated ungracefully.

**Fix:**
- The `truncate` class is already on the span, but the button needs `overflow-hidden` and the text needs to use a smaller `text-[10px]` size
- Shorten the French category labels in `fr/events.json` (e.g., "Apero" instead of full phrase)

---

## Issue 3: Home/Away/Neutral Buttons -- French Labels Overflow

**File:** `src/components/events/UnifiedEventForm.tsx` (lines 486-503)

The `grid-cols-3` layout for Home/Away/Neutral shows `Domicile`, `Exterieur`, `Neutre` in French. "Exterieur" is long and can push out of its button on narrow screens.

**Fix:**
- Shorten French labels: "Dom.", "Ext.", "Neutre" (they already have emoji context)
- Or add `text-xs` and `truncate` to prevent overflow

---

## Issue 4: Opponent Section -- "Selectionner" / "Saisir" Buttons Overflow

**File:** `src/components/events/UnifiedEventForm.tsx` (lines 426-444)

The opponent input mode toggle has two `flex-1` buttons with `size="sm"`. The French "Selectionner" label is long and can clip on narrow screens.

**Fix:**
- Shorten FR translations: `form.game.selectTeam` to "Choisir" and `form.game.enterManually` to "Saisir" (already short -- keep)
- Add `text-xs truncate` to button text

---

## Issue 5: Location Mode Buttons -- Hardcoded English Labels

**File:** `src/components/events/UnifiedEventForm.tsx` (lines 655-683)

The Physical/Virtual/Hybrid buttons have **hardcoded English strings** ("Physical", "Virtual", "Hybrid") -- not translated at all! This is a bug in both EN/FR.

**Fix:**
- Replace hardcoded strings with i18n keys
- Add new translation keys in both `en/events.json` and `fr/events.json`

---

## Issue 6: RSVP Deadline Preset Buttons -- French Text Wraps

**File:** `src/components/events/UnifiedEventForm.tsx` (lines 1220-1232)

The deadline preset buttons ("1 heure avant", "3 heures avant", "1 jour avant", "2 jours avant", "1 semaine avant", "Personnalise") use `flex-wrap` which is correct, but the French strings are long and create a messy multi-row layout.

**Fix:**
- Shorten French deadline labels: "1h", "3h", "1j", "2j", "1 sem", "Perso" (matching the compact style)
- Update `fr/events.json` under `form.deadline`

---

## Issue 7: Event Type Selector Question Text Overflow

**File:** `src/components/events/EventTypeSelector.tsx` (line 25)

The `selectEventType` label in French is: "Quel type d'evenement creez-vous ?" which is long. The Label component doesn't have wrapping protection.

**Fix:**
- Shorten to "Type d'evenement" in French to match the compact aesthetic
- Or ensure the label has `text-sm leading-tight`

---

## Issue 8: "Public/Private" Toggle Button -- Hardcoded English

**File:** `src/components/events/UnifiedEventForm.tsx` (lines 1086-1087)

The toggle button text `'Public'` and `'Private'` is hardcoded in English, not translated.

**Fix:**
- Replace with `t('status.public')` and `t('status.private')` from events translations

---

## Issue 9: DurationPicker "Custom" Label -- Hardcoded English

**File:** `src/components/events/DurationPicker.tsx` (line 78)

The "Custom" button text is hardcoded English.

**Fix:**
- Accept a `lang` prop or use `useTranslation` to show "Perso" in French

---

## Issue 10: EventFilters -- Hardcoded English Labels

**File:** `src/components/events/EventFilters.tsx`

Multiple hardcoded English strings: "Filter by:", "All Types", "Training", "Meetup", "Match", "Upcoming", "Past", "All Events", "Clear", "Clear All Filters", "Public", "Team Only", "Filter Events", "Event Type", "Status", "Visibility", "Filters". None of these are translated.

**Fix:**
- Replace all with i18n translation keys
- Add corresponding entries in both `en/events.json` and `fr/events.json`

---

## Issue 11: CreateSessionDialog -- Hardcoded English

**File:** `src/components/teams/CreateSessionDialog.tsx`

The entire dialog is hardcoded English: "Create Training Session", "Schedule a new training session for your team", "Title *", "Date *", "Start Time *", "End Time *", "Location", "Description", "Cancel", "Create Session".

**Fix:**
- Add `useTranslation` hook and replace all hardcoded strings
- Add translation keys to both locale files

---

## Technical Details

### Files to modify:

| File | Changes |
|------|---------|
| `src/components/events/EventTypeSelector.tsx` | Add `overflow-hidden` to buttons, tighten description text size, add `line-clamp-2` |
| `src/components/events/UnifiedEventForm.tsx` | Add `text-xs truncate` to opponent buttons, translate Physical/Virtual/Hybrid, translate Public/Private toggle, add overflow guards to category buttons |
| `src/components/events/DurationPicker.tsx` | Add i18n support for "Custom" label |
| `src/components/events/EventFilters.tsx` | Replace all hardcoded English with i18n keys |
| `src/components/teams/CreateSessionDialog.tsx` | Add full i18n support |
| `src/i18n/locales/fr/events.json` | Shorten `create.trainingDesc`, `create.meetupDesc`, `create.gameDesc`, `form.deadline.*`, add location mode keys, fix category labels |
| `src/i18n/locales/en/events.json` | Add missing keys for location mode, filters |
| `src/i18n/locales/fr/teams.json` | Add session dialog translation keys |
| `src/i18n/locales/en/teams.json` | Add session dialog translation keys |

### No database changes required.

