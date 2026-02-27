

# UX/UI Upgrade Across 4 Screens

## Files to modify

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Home screen: CTA group, stats grid, team+ card, available game cards |
| `src/components/events/EventCard.tsx` | Event list cards: thicker accent border, tint bg, date badge, Going pill, globe label |
| `src/pages/Events.tsx` | Events list: merge tabs + filters into single 48px row |
| `src/pages/EventDetail.tsx` | Section headers to Title Case, RSVP bar props, calendar button, home_away chip |
| `src/components/events/EventRSVPBar.tsx` | Equal-width 52px buttons, cancel link styling |
| `src/components/events/AddToCalendarButton.tsx` | Show full label always, ghost variant |
| `src/components/events/UnifiedEventForm.tsx` | Date/time/duration restructure, address helper text, icon alignment |
| `src/components/matching/AvailableGameCard.tsx` | Full address display, French "places restantes" |
| `src/components/ui/date-block.tsx` | Smaller compact size (48x52 max), lighter bg |
| `src/i18n/locales/fr/common.json` | Add `spotsLeft` key in French |
| `src/i18n/locales/en/common.json` | Ensure `spotsLeft` key exists |

---

## 1. HOME SCREEN (`src/pages/Index.tsx`)

### CTA buttons — merge into visual group
- Lines 298-328: Replace grid + separate "Équipe +" button with a single row of 2 equal-width buttons:
  - "Trouver un match": `bg-primary text-primary-foreground` (primary fill)
  - "Créer un event": `variant="outline"` with `border-primary/50` (outlined, same border token)
  - Both: `h-14 rounded-xl flex-1`, same row via `flex gap-2`
- Remove the emerald-600/700 hardcoded colors from "Trouver un match"

### "Équipe +" card treatment
- Replace the plain `Button variant="outline"` with a `Card` component:
  - `rounded-xl bg-card border border-border p-3 flex items-center gap-3 cursor-pointer active:scale-[0.98]`
  - Left: `Users` icon in a `h-9 w-9 rounded-full bg-primary/10` circle
  - Center: team name label
  - Right: `ChevronRight` icon

### Stats row — extract from welcome card
- Remove the stats section (lines 245-282) from inside the hero Card
- Place it below the hero card as its own section: a 3-column grid
  - Each cell: number in `text-[28px] font-bold text-foreground` + label in `text-xs text-muted-foreground` below
  - No dividers, `gap-4` between columns
  - Each cell tappable with same navigation targets

### Welcome card upgrade
- Keep avatar but add `ring-2 ring-primary ring-offset-2 ring-offset-background`
- Add sport-relevant subtitle using `profile.primary_sport` if available (e.g. "Prête pour ta prochaine partie de ⚽")

### Available game cards — full address + French strings
- In `AvailableGameCard.tsx` line 79: remove the `substring(0, 25) + '...'` truncation — show full location with `break-words`
- Line 128: replace `t('common:spotsLeft', 'spots left')` — add proper French key `spotsLeft` to fr/common.json as `"places restantes"`

---

## 2. EVENTS LIST SCREEN (`src/pages/Events.tsx`)

### Merge tabs + filters into one 48px row
- Replace the current tab bar (lines ~170-195) and separate filter bar with a single `h-12` row:
  - Left side: 3 text tabs ("Participations", "Organisés", "Découvrir") with underline indicator on active tab (no pill background)
  - Right side: filter icon dropdown + view toggle (list/calendar) + search icon — same as current but in the same row
- Remove the separate filter chips row from "My Events" tab — type filter moves into the tab row or a dropdown

### Event cards — thicker accent + tint
- `EventCard.tsx` line 134: change `border-l-4` to `border-l-[5px]`
- Add a faint background tint on the left edge: wrap CardContent with a div that has a `bg-gradient-to-r from-{type-color}/5 to-transparent` using existing sport color tokens

### Date badge — smaller, lighter
- `DateBlock` compact size: change `w-12` to `w-[48px]` (already close), add `max-h-[52px]`
- Change default bg from `bg-primary/10` to `bg-primary/8` equivalent — use `bg-primary/10` (already there, keep)
- Actually the main issue is the "solid blue" for today events — change `bg-primary` to `bg-primary/15 text-primary` for a lighter look

### "Going" pill — filled success chip
- `EventCard.tsx` line 288: change `bg-success/15 text-success` to `bg-success text-white` (filled chip) and add `<Check className="h-3 w-3" />` icon

### Globe icon — add "Public" label
- Line 179: after the Globe icon, add a `<span className="text-[10px] text-muted-foreground">Public</span>` label

---

## 3. EVENT DETAIL SCREEN (`src/pages/EventDetail.tsx`)

### Section headers — Title Case instead of ALL CAPS
- Lines 373, 491, 529, 541: remove `uppercase` class from all section `<h3>` elements
- Change from `text-xs` to `text-[13px] font-semibold text-muted-foreground` — no `tracking-wide`

### Calendar button — full label, ghost style
- `AddToCalendarButton.tsx` line 80: remove `hidden sm:inline` from the label span — always show "Ajouter au calendrier"
- Change default variant to `"ghost"` in the component call at EventDetail line 326

### RSVP bar — equal-width 52px buttons
- `EventRSVPBar.tsx` lines 87-123: change `h-10` to `h-[52px]` on all 3 buttons
- Change container from `bg-muted/50 rounded-lg p-1` to `p-0 gap-2` — each button gets its own styling:
  - Active: `bg-primary text-primary-foreground` (for Going), keep warning/destructive for others
  - Inactive: `bg-card border border-border`
- Always show labels (remove `hidden xs:inline`)

### Cancel attendance link
- Line 131: change to `text-sm text-primary hover:text-primary/80 mt-3` — larger, accent colored, centered

### Home/Away chip — add context label
- Line 509: change from just `{event.home_away}` to `Terrain : {t('game.' + event.home_away)}`
- Style as muted chip: `bg-muted text-muted-foreground`

---

## 4. EVENT CREATION — QUAND & OÙ (`UnifiedEventForm.tsx`)

### Date/time/duration restructure (renderStep2, lines 682-741)
- **Row 1**: Calendar icon + full date label in one tappable row — currently works but format needs adjustment to show "Sam. 28 Fév · 19:00" format
- **Row 2**: Clock icon + time input + duration chips on same baseline — move the time/duration section into its own `FieldRow` with `Clock` icon instead of nesting inside the CalendarIcon FieldRow
- Remove orphaned `·` dot between time and duration (line 736)

### Address field — add pin icon + helper text
- Already has MapPin icon via FieldRow (line 744) — confirmed aligned
- Add helper text below the DistrictSelector: `<p className="text-xs text-muted-foreground mt-1">Ex: Stade Charléty, Paris</p>`

### Icon alignment
- All FieldRows already use the same `FieldRow` component with consistent `h-9 w-9` icon containers — alignment is inherently consistent. Verify no manual overrides.

---

## 5. TRANSLATION FIXES

### `src/i18n/locales/fr/common.json`
- Add: `"spotsLeft": "places restantes"` (already partially exists in events.json under lookingForPlayers)
- Verify `"going"` in status is "Inscrite" (already correct)

### `src/i18n/locales/en/common.json`
- `"spotsLeft"` already has fallback "spots left" in code — add explicit key

### Hardcoded English in EventCard
- Line 106: `t('common:going', 'Going')` — the fallback "Going" only shows if key missing. FR key exists as "Inscrite". OK.
- Line 257: `t('common:going', 'going')` — used for count display. Needs to use different key for "inscrites" vs "going" in context.

