

# Events List Screen Redesign

## Files to modify (4 files)

| File | Changes |
|------|-------|
| `src/pages/Events.tsx` | Consolidate nav into 2 rows: underline tabs + scrollable sport chips; move view/search icons into tab row |
| `src/components/events/EventCard.tsx` | Add type-based bg tint; increase title to 17px; ensure status badge uses high-contrast success styling |
| `src/components/mobile/FAB.tsx` | Increase to 56px circle (`h-14 w-14`) |
| `src/components/EmptyState.tsx` | Increase title to 16px semibold; add emoji/icon size bump |

---

## 1. Events.tsx — Tab row (Row 1, 48px)

Replace current muted-bg segmented control (lines 228-254) with an underline-style tab bar:

```tsx
<div className="flex items-center h-12 border-b border-border">
  <div className="flex-1 flex">
    {TAB_CONFIG.map(({ key, labelKey }) => (
      <button
        key={key}
        className={cn(
          "flex-1 h-12 text-sm font-medium transition-colors relative",
          activeTab === key ? "text-primary" : "text-muted-foreground"
        )}
        onClick={() => handleTabChange(key)}
      >
        {t(labelKey)}
        {activeTab === key && (
          <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full" />
        )}
      </button>
    ))}
  </div>
  {/* Right: view toggles + search (only on 'my' tab) */}
  <div className="flex items-center gap-1 shrink-0">
    {activeTab === 'my' && (
      <>
        <Button size="icon" variant={viewMode === 'list' ? "default" : "ghost"} className="h-8 w-8" onClick={...}>
          <List className="h-5 w-5" />
        </Button>
        <Button size="icon" variant={viewMode === 'calendar' ? "default" : "ghost"} className="h-8 w-8" onClick={...}>
          <CalendarIcon className="h-5 w-5" />
        </Button>
      </>
    )}
    <Button size="icon" variant={showSearch ? "default" : "ghost"} className="h-8 w-8" onClick={...}>
      <Search className="h-5 w-5" />
    </Button>
  </div>
</div>
```

Remove tab icons — text-only tabs. Remove Badge counts from tabs (cleaner).

## 2. Events.tsx — Sport filter chips (Row 2, 40px)

Move below the tab row. Render on all tabs (not just 'my'). Horizontally scrollable, pill style:

```tsx
<div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
  <Button
    size="sm"
    className={cn("h-8 px-3 text-xs rounded-full shrink-0",
      activeEventType === 'all' ? "bg-primary text-primary-foreground" : "bg-card border text-foreground"
    )}
    onClick={() => { setActiveEventType('all'); setTypeFilter('all'); }}
  >
    {t('types.all')}
  </Button>
  {EVENT_TYPE_LEGEND.map(({ type, labelKey, icon: Icon }) => (
    <Button key={type} size="sm" className={cn("h-8 px-3 text-xs rounded-full shrink-0 gap-1.5",
      activeEventType === type ? "bg-primary text-primary-foreground" : "bg-card border text-foreground"
    )} onClick={...}>
      <Icon className="h-3.5 w-3.5" />
      {t(labelKey)}
    </Button>
  ))}
</div>
```

Remove duplicate filter rows from 'organized' and 'my' tab sections — they now share the single row above.

## 3. EventCard.tsx — Type-based background tint

Add a subtle 4% opacity color tint matching the left border. At line 131, extend the Card className:

```tsx
<Card className={cn(
  "border-l-[5px] overflow-hidden transition-all active:scale-[0.98]",
  accentClass,
  // Add type-based bg tint
  event.type === 'training' && "bg-info/[0.04]",
  event.type === 'match' && "bg-warning/[0.04]",
  event.type === 'meetup' && "bg-success/[0.04]",
  isPast && "opacity-60"
)}>
```

Update title to 17px: line 153 change `text-base` to `text-[17px]`.

## 4. FAB.tsx — 56px circle

Change `h-12 w-12` to `h-14 w-14` (56px).

## 5. EmptyState.tsx — Larger title

Change title from `text-sm` to `text-base font-semibold` (16px). Increase icon wrapper size.

## Summary

| Change | Detail |
|--------|--------|
| Tab bar | Underline-style text tabs, 48px height, no icons |
| Sport chips | Shared scrollable row, pill style, bg-primary active |
| View/search icons | Right-aligned in tab row, 20px icons |
| Card bg tint | 4% opacity type color on card background |
| Card title | 17px semibold |
| FAB | 56px circle |
| Empty state | 16px title |
| Filter dedup | Remove duplicate filter rows from organized/my sections |

