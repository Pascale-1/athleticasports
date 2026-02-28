

# Full-App UX/UI Revamp — Single Pass

## Files to modify (11 files)

| File | Scope |
|------|-------|
| `src/components/events/EventCard.tsx` | Fix i18n keys, show full location, RSVP pill styling |
| `src/i18n/locales/fr/common.json` | Add missing top-level keys for EventCard i18n |
| `src/i18n/locales/en/common.json` | Add matching top-level keys |
| `src/i18n/locales/fr/events.json` | Add `game.terrain.*` keys |
| `src/pages/Events.tsx` | Add `pb-24` to scroll container for FAB overlap fix |
| `src/pages/EventDetail.tsx` | Fix location truncation, home_away chip, section headers already Title Case (verify) |
| `src/components/events/EventRSVPBar.tsx` | Cancel link: 14px, centered, min tap target |
| `src/components/mobile/FAB.tsx` | Raise z-index, adjust bottom position |
| `src/pages/Index.tsx` | Fix hardcoded emerald colors, CTA height to 52px, pb-24 |
| `src/components/matching/AvailableGameCard.tsx` | Verify full address display |
| `src/components/teams/TeamSelector.tsx` | French "Équipe introuvable" string already present — verify |

---

## 1. CRITICAL: Fix i18n key mismatch (EventCard shows English fallbacks)

**Root cause**: `EventCard.tsx` calls `t('common:going')` which resolves to top-level key `going` in common namespace. But FR `common.json` has `status.going = "Inscrite"`, not a top-level `going`.

**Fix in `EventCard.tsx`**: Change all `t('common:going', ...)` to `t('common:status.going', ...)`, etc:
- `t('common:going', 'Going')` → `t('common:status.going')`  
- `t('common:maybe', 'Maybe')` → `t('common:status.maybe')`
- `t('common:declined', "Can't")` → `t('common:status.declined')`
- `t('common:join', 'Join')` → `t('common:actions.join')`
- `t('common:past', 'Past')` → `t('common:status.past', 'Passé')`  (wait, FR has `time.past = "Passé"`)
- `t('common:full', 'Full')` → `t('common:status.full')`

Also in the RSVP dropdown:
- Line 304: `t('common:going', 'Going')` → `t('rsvp.going')` (use events namespace since we're already in it)
- Line 311: `t('common:maybe', 'Maybe')` → `t('rsvp.maybe')`
- Line 319: `t('common:declined', "Can't Go")` → `t('rsvp.notGoing')`

Line 257 count display: `t('common:going', 'going')` → `t('rsvp.going')` or use `t('common:status.going')`

## 2. CRITICAL: FAB overlap fix

**`src/pages/Events.tsx`**: The scroll container `<div className="space-y-3 animate-fade-in">` at line 206 needs `pb-24` to ensure last card isn't hidden behind FAB.

**`src/components/mobile/FAB.tsx`**: Change `bottom-16` to `bottom-20` so the FAB sits above the bottom navigation with more clearance.

## 3. CRITICAL: Event location — show full address

**`EventCard.tsx` line 97-99**: Currently splits on comma and shows only venue name. Change to show full location:
```tsx
const venueName = event.location || null;
```

Keep `line-clamp-2 break-words` on the display span (already there).

## 4. CRITICAL: EventDetail location truncation

**`EventDetail.tsx` line 408**: Has `truncate` class on location text. Change to `break-words line-clamp-2`.

## 5. Home screen — fix hardcoded colors

**`Index.tsx` line 329**: `bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/30` — replace with token-based: `bg-success/5 border-success/20`

Lines 332-333, 335, 338, 345-346: Replace all `emerald-*` with `success` token equivalents.

CTA buttons at line 293: height is `h-14` (56px). Change to `h-[52px]` per spec.

Add `pb-24` to main content container (line 195: `space-y-4 pb-16` → `space-y-4 pb-24`).

## 6. EventDetail — home_away chip

**Line 512**: Currently `t('game.terrain.${event.home_away}')` — but FR events.json doesn't have `game.terrain.*`, it has `game.home`, `game.away`, `game.neutral`.

Fix: Change to `t('game.${event.home_away}')` and add prefix "Terrain : " in the JSX.

Also add `game.terrain` keys to FR events.json as alias, OR fix the reference.

## 7. EventRSVPBar — cancel link tap target

**Line 131-137**: Already has `text-sm text-primary mt-3`. Change to `text-[14px] text-primary hover:text-primary/80 mt-4 min-h-[44px] flex items-center justify-center`.

## 8. Globe icon on EventCard

**Line 178-180**: Already shows "Public" label next to globe. Keep as-is. The `Lock` icon for private has no label — add "Privé" text.

## 9. EventCard RSVP pill — "Going" to filled success

**Line 288**: `bg-success text-white` is already applied. Verify the `Check` icon is included — yes, `StatusIcon` renders `Check` when attending. Correct.

## 10. Translation additions

**`fr/common.json`** — add top-level convenience keys (even though proper path exists):
No, better to fix the code to use correct paths. Already covered in step 1.

**`fr/events.json`** — add terrain keys:
```json
"game": {
  ...existing...,
  "terrain": {
    "home": "Domicile",
    "away": "Extérieur", 
    "neutral": "Neutre"
  }
}
```

## Summary of all changes

| Issue | File | Fix |
|-------|------|-----|
| English fallbacks in EventCard | `EventCard.tsx` | Fix 10+ `t()` calls to use correct key paths |
| FAB overlaps last card | `Events.tsx`, `FAB.tsx` | Add `pb-24`, raise FAB position |
| Location truncated to first comma | `EventCard.tsx` | Show full `event.location` |
| Location truncated in detail | `EventDetail.tsx` | `truncate` → `break-words` |
| Hardcoded emerald colors | `Index.tsx` | Replace with `success` tokens |
| CTA height inconsistency | `Index.tsx` | `h-14` → `h-[52px]` |
| home_away key missing | `EventDetail.tsx`, `fr/events.json` | Fix key path + add translations |
| Cancel link too small | `EventRSVPBar.tsx` | Increase size + min tap target |
| Private icon has no label | `EventCard.tsx` | Add "Privé" label |
| Insufficient bottom padding | `Index.tsx` | `pb-16` → `pb-24` |

