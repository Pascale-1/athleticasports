

# Event Detail Screen Redesign

## Files to modify (3 files)

| File | Changes |
|------|---------|
| `src/pages/EventDetail.tsx` | Header badges, title size, calendar button label, section headers to Title Case, location link style, home_away pill, RSVP bar layout |
| `src/components/events/EventRSVPBar.tsx` | 3 equal flex-1 buttons at 52px, 14px semibold labels, cancel button above bar with 8px margin |
| `src/components/events/EventAttendees.tsx` | Avatar overlap max 5, summary line "X confirmés · X peut-être" in 13px muted |

---

## 1. EventDetail.tsx — Header (lines 304-328)

**Badges**: Sport type + visibility on one line, 12px pill style:
```tsx
<div className="flex items-center gap-2 mb-3">
  <Badge variant="secondary" className="text-xs rounded-full px-2.5 py-0.5"
    style={{ backgroundColor: eventConfig.bgColor, color: eventConfig.color }}>
    <EventIcon className="h-3 w-3 mr-1" />
    {t(`types.${getEventTypeKey(event.type)}`)}
  </Badge>
  <Badge variant="outline" className="text-xs rounded-full px-2.5 py-0.5">
    {event.is_public ? t('status.public') : t('status.private', 'Privé')}
  </Badge>
  {/* team/past/ongoing badges follow */}
</div>
```

**Title**: Change `text-2xl` to `text-[26px]`, keep `font-bold`.

**Calendar button**: Already using `AddToCalendarButton` with `variant="ghost"` — this is correct per spec. No change needed.

## 2. EventDetail.tsx — Section headers (lines 373, 491, 529, 541)

All already use `text-[13px] text-muted-foreground font-semibold` — they're Title Case in the translation file. Verify translations match:
- `details.whereAndWhen` → "Quand et où" ✓
- `details.matchInfo` → "Infos du match" ✓  
- `details.whoComing` → "Qui vient ?" ✓
- `details.about` → "À propos" ✓

No changes needed — translations already Title Case.

## 3. EventDetail.tsx — Home/away pill (lines 508-514)

Change from `Badge variant="outline"` to pill style with `bg-muted rounded-full text-[13px]`:
```tsx
<Badge variant="outline" className="bg-muted rounded-full text-[13px] text-muted-foreground">
  {event.home_away === 'home' && <Home className="h-3 w-3 mr-1" />}
  {event.home_away === 'away' && <Plane className="h-3 w-3 mr-1" />}
  Terrain : {t(`game.${event.home_away}`)}
</Badge>
```

## 4. EventDetail.tsx — Location link (lines 396-441)

Replace the dropdown trigger's "Ouvrir dans Plans" subtitle with an accent-colored underlined link style:
```tsx
<p className="text-xs text-primary underline">
  {t('details.tapToOpenMaps')}
</p>
```
Remove `line-clamp-2` from address to show full display.

## 5. EventRSVPBar.tsx — RSVP buttons redesign (lines 88-137)

- All 3 buttons: `flex-1 h-[52px]`, `text-sm font-semibold` (14px)
- Active attending: `bg-primary text-primary-foreground`
- Active maybe: `bg-warning text-warning-foreground`  
- Active not_attending: `bg-destructive text-destructive-foreground`
- Inactive: `bg-card border border-border text-muted-foreground`
- Move "Annuler ma participation" button ABOVE the RSVP button row, 14px accent color, min-h-[44px], mb-2

Restructure the layout:
```tsx
<div className="max-w-lg mx-auto space-y-2">
  {/* Cancel button above */}
  {userStatus && !isCommitted && (
    <Button variant="ghost" size="sm" onClick={onRemoveAttendance}
      className="w-full text-sm font-semibold text-primary min-h-[44px]">
      {t('rsvp.cancelAttendance')}
    </Button>
  )}
  {/* 3 equal buttons */}
  <div className="flex gap-2">
    {/* attending/maybe/not_attending buttons with h-[52px] flex-1 */}
  </div>
  <p className="text-xs text-center text-muted-foreground">...</p>
</div>
```

## 6. EventAttendees.tsx — Participant summary

The component already shows overlapping avatars (max 5) and names. Update the summary line below avatars to use 13px muted format "X confirmés · X peut-être":
```tsx
<p className="text-[13px] text-muted-foreground">
  {grouped.attending.length} {t('attendees.going').toLowerCase()} · {grouped.maybe.length} {t('attendees.maybe').toLowerCase()}
</p>
```

## Summary

| Element | Change |
|---------|--------|
| Header badges | 12px pill, sport + visibility on one line |
| Title | 26px bold |
| Section headers | Already Title Case — no change |
| Home/away | Pill: `bg-muted rounded-full text-[13px]` with "Terrain :" prefix |
| Location | Full address, accent underlined link |
| RSVP buttons | 3 × flex-1, 52px, 14px semibold |
| Cancel button | Moved above RSVP row, 14px accent, 44px tap target |
| Attendees summary | "X confirmés · X peut-être" in 13px muted |

