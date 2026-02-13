

# Fix Visibility Toggle Wording, Address Overflow, Public Badge on Card, and Modernize Form

## 1. Fix Public/Private Toggle Description (Static Wording)

**Problem**: The toggle description always says "Visible to all users" / "Visible par tous les utilisateurs" regardless of state.

**Fix in `src/components/events/UnifiedEventForm.tsx` (lines 1081-1083)**:
- Make the label and description dynamic based on `field.value`
- When ON (public): "Public Event" + "Visible to all users"
- When OFF (private): "Private Event" + "Only invited members can see this"

**Translation keys to add** in both `en/events.json` and `fr/events.json`:
- `form.isPrivate`: "Private Event" / "Evenement prive"
- `form.isPrivateDesc`: "Only invited members can see this" / "Seuls les membres invites peuvent voir"

## 2. Fix Address Overflow on Event Card

**Problem**: In `EventCard.tsx` line 208-216, the location `<span className="truncate">` is inside a non-flex `<div>`, so CSS `truncate` has no effect. Long addresses push the card wider.

**Fix in `src/components/events/EventCard.tsx` (line 208)**:
- Change the time+location container from plain `<div>` to a flex container with `overflow-hidden`
- Wrap location in a `<span>` with proper `truncate` and `min-w-0` constraints
- This supplements the existing character-slicing (16 chars) with CSS-level protection

Change:
```html
<div className="text-xs text-muted-foreground">
```
to:
```html
<div className="text-xs text-muted-foreground flex items-center min-w-0 overflow-hidden">
```

Also wrap the location span properly:
```html
<span className="truncate min-w-0">{displayLocation}</span>
```

## 3. Show Public/Private Badge on Event Card

**Problem**: No visual indicator of event visibility on the card.

**Fix in `src/components/events/EventCard.tsx`**: Add a small Globe or Lock icon next to the type badge in Row 1.

After the type badge (line 158), add:
```tsx
{event.is_public ? (
  <Globe className="h-3 w-3 text-muted-foreground/60 shrink-0" />
) : (
  <Lock className="h-3 w-3 text-muted-foreground/60 shrink-0" />
)}
```

Import `Globe` and `Lock` from lucide-react.

## 4. Modernize the Event Creation Form

The form is already well-structured with progressive disclosure. The key improvements for a more streamlined, modern feel:

### a. Group optional sections into a single "More Options" area
Currently there are 5+ separate ghost buttons scattered at the bottom (Add description, Make recurring, Set participant limit, RSVP deadline). Group them into a clean, labeled section.

**Change (lines 744-745)**: Replace the `<div className="space-y-2">` wrapper with a visually distinct "More Options" section:
```tsx
<div className="space-y-2">
  <Label className="text-xs text-muted-foreground uppercase tracking-wide px-1">
    {t('form.moreOptions', 'More options')}
  </Label>
  {/* existing toggle buttons */}
</div>
```

### b. Clean up the visibility toggle styling
Replace the current button-style toggle with a cleaner Switch component for consistency with the "Looking for Players" section. This makes the form feel more cohesive.

**Change (lines 1074-1097)**:
```tsx
<div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border">
  <div className="flex items-center gap-2">
    {field.value ? <Globe .../> : <Lock .../>}
    <div>
      <p className="text-sm font-medium">
        {field.value ? t('form.isPublic') : t('form.isPrivate')}
      </p>
      <p className="text-xs text-muted-foreground">
        {field.value ? t('form.isPublicDesc') : t('form.isPrivateDesc')}
      </p>
    </div>
  </div>
  <FormControl>
    <Switch checked={field.value} onCheckedChange={field.onChange} />
  </FormControl>
</div>
```

### c. Move visibility toggle right after the "Where" section
It's already placed there in the current code (after participant limit). Confirm it stays in that logical position: Type -> Title -> When -> Where -> Visibility -> Optional extras.

### d. Translation keys to add

**English (`en/events.json`)**:
```json
"form.isPrivate": "Private Event",
"form.isPrivateDesc": "Only invited members can see this",
"form.moreOptions": "More options"
```

**French (`fr/events.json`)**:
```json
"form.isPrivate": "Evenement prive",
"form.isPrivateDesc": "Seuls les membres invites peuvent voir",
"form.moreOptions": "Plus d'options"
```

## Summary of File Changes

| File | Changes |
|------|---------|
| `src/components/events/EventCard.tsx` | Fix location overflow (flex + truncate), add Globe/Lock icon for visibility |
| `src/components/events/UnifiedEventForm.tsx` | Dynamic toggle wording, Switch instead of Button, "More options" section label |
| `src/i18n/locales/en/events.json` | Add `isPrivate`, `isPrivateDesc`, `moreOptions` keys |
| `src/i18n/locales/fr/events.json` | Add `isPrivate`, `isPrivateDesc`, `moreOptions` keys |

No database or schema changes needed.

