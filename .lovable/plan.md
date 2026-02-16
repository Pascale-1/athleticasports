

# Improve Quick Action Buttons — Clearer Labels and Better UX

## Problem

The two main action buttons on the home screen use very short, ambiguous labels:
- **"Dispo"** — cryptic abbreviation, doesn't explain what happens when you tap it
- **"Organiser"** — vague, organize what exactly?

For a women-only sports community app, these buttons are the primary entry points. They need to be instantly understandable.

## Proposed Changes

### 1. Better Labels with Action-Oriented Wording

| Current (FR) | Current (EN) | Proposed (FR) | Proposed (EN) |
|---|---|---|---|
| Dispo | Find Game | Trouver un match | Find a Game |
| Organiser | Organize | Creer un event | Create Event |

The labels become verb-first, telling the user exactly what tapping the button does.

### 2. Add Short Subtitles for Context

Each button gets a tiny one-line subtitle beneath the label to reinforce the action:

- **Find a Game**: subtitle "Set your availability" / "Indique ta dispo"
- **Create Event**: subtitle "Match, training, hangout" / "Match, entrainement, sortie"

### 3. Visual Layout Adjustment

Keep the 2-column grid but make the buttons slightly taller (h-16 to h-20) to accommodate the subtitle without feeling cramped. The icon stays above the label.

```text
+-------------------------+  +-------------------------+
|       [Search icon]     |  |       [Plus icon]       |
|    Trouver un match     |  |     Creer un event      |
|   Indique ta dispo      |  | Match, entrainement...  |
+-------------------------+  +-------------------------+
```

### 4. Keep the "Create Team" Button Below

No changes to the third row button — it's already clear.

## Technical Changes

### File: `src/i18n/locales/fr/common.json`
- Update `quickActions.findGame` from `"Dispo"` to `"Trouver un match"`
- Update `quickActions.organizeEvent` from `"Organiser"` to `"Creer un event"`
- Add `quickActions.findGameSubtitle`: `"Indique ta dispo"`
- Add `quickActions.organizeEventSubtitle`: `"Match, entrainement, sortie"`

### File: `src/i18n/locales/en/common.json`
- Update `quickActions.findGame` from `"Find Game"` to `"Find a Game"`
- Update `quickActions.organizeEvent` from `"Organize"` to `"Create Event"`
- Add `quickActions.findGameSubtitle`: `"Set your availability"`
- Add `quickActions.organizeEventSubtitle`: `"Match, training, hangout"`

### File: `src/pages/Index.tsx`
- Update the two Button components in the Quick Actions section (lines 299-316):
  - Increase height from `h-16` to `h-20`
  - Add a subtitle `<span>` below each label with `text-[10px] opacity-80` styling
  - Use the new translation keys for subtitles

## Result

**Before**: Two cryptic one-word buttons ("Dispo", "Organiser")
**After**: Two clear action buttons with descriptive labels and helpful subtitles that tell new users exactly what each button does

