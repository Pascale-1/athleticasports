

# Event Card Redesign — Compact 2-Row Layout with Inline RSVP

Completely rewrite `EventCard.tsx` to a tight 2-row layout (~90px max height) with an embedded inline RSVP pill toggle replacing the current dropdown menu approach.

---

## File: `src/components/events/EventCard.tsx` — Full rewrite

### Layout structure

```text
┌─ 2px accent ─┬────────────────────────────────────────────────┐
│              │ ROW 1: [40x40 date] [title + meta]  [Public|X] │
│              │ ROW 2: [ ✓ Going ][ ? Maybe ][ ✗ Can't Go ]    │
└──────────────┴────────────────────────────────────────────────┘
```

### Changes

1. **Remove** the left DateBlock column + vertical divider layout. Replace with a flat 2-row card.

2. **ROW 1** — single flex row:
   - LEFT: 40x40px date badge (`rounded-lg bg-muted`), day number 14px bold `text-primary`, month 9px uppercase `text-muted-foreground`
   - CENTER (flex-1): event title 13px semibold `text-foreground`, below it a single metadata line: sport emoji + time + "·" + city name, all 11px `text-muted-foreground`
   - RIGHT: visibility label (Public/Privé) 10px `text-muted-foreground`, below it "X going" 10px `text-muted-foreground`
   - Organizer dropdown menu preserved but only the `⋮` trigger

3. **ROW 2** — full-width inline RSVP toggle (only when `onRSVPChange` is provided):
   - Height 26px, margin-top 6px, 3 equal-width pills in a flex row with gap-1.5
   - Each pill: `rounded-full`, 11px medium text, icons 12px
   - Inactive: `bg-muted text-muted-foreground`
   - Active Going: `bg-success text-success-foreground`
   - Active Maybe: `bg-primary/10 text-primary` (primary-subtle)
   - Active Can't Go: `bg-destructive/10 text-destructive` (danger-subtle)
   - Click handler: if tapping active status → call `onRSVPChange` with same status (parent handles toggle-off); otherwise set new status
   - `e.preventDefault()` on each button to prevent Link navigation

4. **Card wrapper**:
   - `border-l-[2px]` (down from 5px) with TYPE_ACCENT mapping unchanged (match=primary/gold, training=success/green, meetup=accent/gold)
   - Remove tinted background classes (`bg-primary/[0.04]` etc.) — just use card surface
   - Keep `active:scale-[0.98]` press animation
   - Padding: `py-2.5 px-3.5` (10px vertical, 14px horizontal)

5. **Remove**: AvatarStack import, avatar display, players-needed badge, Clock/MapPin icon imports (metadata on single line without icons), capacity fraction display. Keep it minimal.

6. **Keep**: organizer dropdown menu (edit/delete), past event opacity, recurring icon, Link wrapper.

### Updated accent border width
Change `border-l-[5px]` → `border-l-[2px]` per spec.

---

## No other files need changes

The `EventRSVPBar.tsx` (detail page sticky bar) remains unchanged. This only affects the list card component.

